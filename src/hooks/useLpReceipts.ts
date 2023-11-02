/**
 * When encountering error `Cannot find module, or type declarations`, Run codegen with `yarn codegen`
 * @austin-builds
 */

import { Client } from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { Address, useAccount } from 'wagmi';
import { PAGE_SIZE } from '~/constants/arbiscan';
import { lpGraphSdk } from '~/lib/graphql';
import {
  AddLiquidity_OrderBy,
  OrderDirection,
  RemoveLiquidity_OrderBy,
  Sdk,
} from '~/lib/graphql/sdk/lp';
import { LpReceipt, LpToken } from '~/typings/lp';
import { MarketLike, Token } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { trimMarket } from '~/utils/market';
import { bigintify, divPreserved, formatDecimals } from '~/utils/number';
import { PromiseOnlySuccess, promiseSlowLoop } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useChromaticLp } from './useChromaticLp';
import { useError } from './useError';
import { useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

type GetReceiptsArgs = {
  count: number;
  walletAddress: Address;
  lpAddress: Address;
  toBlockTimestamp: bigint;
};

const getAddReceipts = async (graphSdk: Sdk, args: GetReceiptsArgs) => {
  const { walletAddress, lpAddress, toBlockTimestamp, count } = args;
  const { addLiquidities } = await graphSdk.AddLiquidities({
    count,
    orderBy: AddLiquidity_OrderBy.BlockTimestamp,
    orderDirection: OrderDirection.Desc,
    walletAddress,
    lpAddress,
    toBlockTimestamp: toBlockTimestamp.toString(),
  });
  if (addLiquidities.length <= 0) {
    return new Map<bigint, LpReceipt>();
  }
  const endId = addLiquidities[0].receiptId;
  const fromId = addLiquidities[addLiquidities.length - 1].receiptId;
  const { addLiquiditySettleds } = await graphSdk.AddLiquiditySettleds({
    fromId,
    endId,
    lpAddress,
  });

  const addSettledMap = addLiquiditySettleds.reduce((map, current) => {
    const { lpTokenAmount, receiptId } = bigintify(current, 'lpTokenAmount', 'receiptId');
    map.set(receiptId, {
      id: receiptId,
      mintedAmount: lpTokenAmount,
      isSettled: true,
    } as LpReceipt);
    return map;
  }, new Map<bigint, LpReceipt>());
  const addMap = addLiquidities.reduce((map, current) => {
    const { receiptId, recipient, amount, oracleVersion, blockNumber, blockTimestamp } = bigintify(
      current,
      'receiptId',
      'amount',
      'oracleVersion',
      'blockNumber',
      'blockTimestamp'
    );
    const settled = addSettledMap.get(receiptId) ?? { isSettled: false };
    map.set(receiptId, {
      action: 'minting',
      id: receiptId,
      lpAddress,
      recipient,
      amount,
      blockNumber,
      blockTimestamp,
      isIssued: true,
      ...settled,
    } as LpReceipt);
    return map;
  }, new Map<bigint, LpReceipt>());
  return addMap;
};

const getRemoveReceipts = async (graphSdk: Sdk, args: GetReceiptsArgs) => {
  const { walletAddress, lpAddress, toBlockTimestamp, count } = args;
  const { removeLiquidities } = await graphSdk.RemoveLiquidities({
    count,
    orderBy: RemoveLiquidity_OrderBy.BlockTimestamp,
    orderDirection: OrderDirection.Desc,
    walletAddress,
    lpAddress,
    toBlockTimestamp: toBlockTimestamp.toString(),
  });
  if (removeLiquidities.length <= 0) {
    return new Map<bigint, LpReceipt>();
  }
  const endId = removeLiquidities[0].receiptId;
  const fromId = removeLiquidities[removeLiquidities.length - 1].receiptId;
  const { removeLiquiditySettleds } = await graphSdk.RemoveLiquiditySettleds({
    fromId,
    endId,
    lpAddress,
  });
  const removeSettledMap = removeLiquiditySettleds.reduce((map, current) => {
    const { receiptId, witdrawnSettlementAmount, refundedAmount } = bigintify(
      current,
      'receiptId',
      'witdrawnSettlementAmount',
      'refundedAmount'
    );
    map.set(receiptId, {
      id: receiptId,
      burnedAmount: witdrawnSettlementAmount,
      remainedAmount: refundedAmount,
      isSettled: true,
      hasReturnedValue: refundedAmount !== 0n,
    } as LpReceipt);
    return map;
  }, new Map<bigint, LpReceipt>());
  const removeMap = removeLiquidities.reduce((map, current) => {
    const { receiptId, recipient, lpTokenAmount, blockNumber, blockTimestamp } = bigintify(
      current,
      'receiptId',
      'lpTokenAmount',
      'oracleVersion',
      'blockNumber',
      'blockTimestamp'
    );
    const settled = removeSettledMap.get(receiptId) ?? { isSettled: false };
    map.set(receiptId, {
      action: 'burning',
      id: receiptId,
      lpAddress,
      recipient,
      amount: lpTokenAmount,
      blockNumber,
      blockTimestamp,
      isIssued: true,
      ...settled,
    } as LpReceipt);
    return map;
  }, new Map<bigint, LpReceipt>());
  return removeMap;
};

type MapToDetailedReceiptsArgs = {
  client: Client;
  receipts: LpReceipt[];
  currentMarket: MarketLike;
  currentAction: 'all' | 'minting' | 'burning';
  settlementToken: Token;
  clpMeta: Record<`0x${string}`, LpToken>;
};

const mapToDetailedReceipts = async (args: MapToDetailedReceiptsArgs) => {
  const { client, receipts, currentAction, currentMarket, settlementToken, clpMeta } = args;
  const detailedReceipts = receipts.map(async (receipt) => {
    const clpToken = clpMeta[receipt.lpAddress];
    const status = receipt.isIssued && receipt.isSettled ? 'completed' : 'standby';
    let detail = '';
    const token = {
      name: receipt.action === 'minting' ? clpToken?.symbol : settlementToken?.name,
      decimals: receipt.action === 'minting' ? clpToken.decimals : settlementToken?.decimals,
      logo: receipt.action === 'burning' ? settlementToken?.image : clpToken.image,
    };

    if (status === 'completed' && receipt.action === 'minting' && receipt.isSettled) {
      detail = formatDecimals(receipt.mintedAmount, token.decimals, 2, true) + ' ' + token.name;
    }

    if (status === 'completed' && receipt.action === 'burning' && receipt.isSettled) {
      detail = formatDecimals(receipt.burnedAmount, token.decimals, 2, true) + ' ' + token.name;
    }
    let message = status === 'standby' ? 'Waiting for the next oracle round' : 'Completed';
    const key = `${token.name}-${currentAction}-receipt-${receipt.id}-${receipt.action}-${status}`;

    if (receipt.action === 'burning' && receipt.remainedAmount > 0n) {
      const dividedByAmount = divPreserved(
        receipt.remainedAmount,
        receipt.amount,
        clpToken.decimals
      );
      const returnedRatio = formatDecimals(dividedByAmount * 100n, clpToken.decimals, 2, true);
      message = `${returnedRatio}% withdrawn`;
    }
    const remainedDetail = isNotNil(receipt.remainedAmount)
      ? formatDecimals(receipt.remainedAmount, clpToken.decimals, 2, true)
      : undefined;

    return {
      ...receipt,
      key,
      status,
      message,
      detail: [detail, remainedDetail],
      token,
    } satisfies LpReceipt;
  });
  return detailedReceipts;
};

type UseLpReceipts = {
  currentAction: 'all' | 'minting' | 'burning';
};

export const useLpReceipts = (props: UseLpReceipts) => {
  const { isReady, lpClient, client } = useChromaticClient();
  const { address } = useAccount();
  const { currentMarket } = useMarket();
  const { tokens } = useSettlementToken();
  const { lpList } = useChromaticLp();
  const clpMeta = useMemo(() => {
    if (isNil(lpList)) {
      return;
    }
    const metadata = lpList.reduce(
      (record, { clpName, clpSymbol, clpDecimals, image, address }) => {
        record[address] = {
          name: clpName,
          symbol: clpSymbol,
          decimals: clpDecimals,
          image,
          address,
        };
        return record;
      },
      {} as Record<Address, LpToken>
    );
    return metadata;
  }, [lpList]);

  const { currentAction } = props;

  const {
    data: receiptsData,
    error,
    isLoading,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(
    (pageIndex, previousData?: { receipts: LpReceipt[]; toBlockTimestamp: bigint }) => {
      if (!isReady) {
        return null;
      }
      if (previousData && !previousData?.receipts) {
        return null;
      }
      if (previousData?.receipts && previousData?.receipts?.length <= 0) {
        return null;
      }
      const fetchKey = {
        key: 'getChromaticLpReceiptsNext',
        walletAddress: address,
        tokens,
        currentMarket: trimMarket(currentMarket),
        clpMeta,
        currentAction,
        pageIndex,
      };
      if (!checkAllProps(fetchKey)) {
        return null;
      }
      return { ...fetchKey, toBlockTimestamp: previousData?.toBlockTimestamp };
    },
    async ({
      walletAddress,
      currentMarket,
      tokens,
      clpMeta,
      currentAction,
      toBlockTimestamp,
      pageIndex,
    }) => {
      const defaultToBlockTimestamp = BigInt(Math.round(Date.now() / 1000));
      const lpAddresses = Object.keys(clpMeta) as Address[];
      const settlementToken = tokens.find((token) => token.address === currentMarket.tokenAddress);
      if (isNil(settlementToken)) {
        throw new Error('Tokens invalid');
      }

      const count = pageIndex === 0 ? 2 : PAGE_SIZE;
      let receipts: LpReceipt[] = [];

      await promiseSlowLoop(
        lpAddresses,
        async (lpAddress) => {
          let currentReceipts = [] as LpReceipt[];
          if (currentAction !== 'burning') {
            const addMap = await getAddReceipts(lpGraphSdk, {
              count,
              walletAddress,
              lpAddress,
              toBlockTimestamp: toBlockTimestamp ?? defaultToBlockTimestamp,
            });
            currentReceipts = currentReceipts.concat(Array.from(addMap.values()));
          }
          if (currentAction !== 'minting') {
            const removeMap = await getRemoveReceipts(lpGraphSdk, {
              count,
              walletAddress,
              lpAddress,
              toBlockTimestamp: toBlockTimestamp ?? defaultToBlockTimestamp,
            });
            currentReceipts = currentReceipts.concat(Array.from(removeMap.values()));
          }
          receipts = receipts.concat(currentReceipts);
        },
        {
          interval: 400,
        }
      );
      receipts.sort((previous, next) => {
        if (isNil(previous.blockTimestamp) && isNil(next.blockTimestamp)) {
          return 0;
        }
        if (isNil(previous.blockTimestamp) && isNotNil(next.blockTimestamp)) {
          return 1;
        }
        if (isNil(previous.blockTimestamp) && isNil(next.blockTimestamp)) {
          return -1;
        }
        return previous.blockTimestamp < next.blockTimestamp ? 1 : -1;
      });
      receipts = receipts.slice(0, count);
      const detailedReceipts = await mapToDetailedReceipts({
        client,
        receipts,
        currentMarket,
        currentAction,
        settlementToken,
        clpMeta,
      });
      const finalReceipts = await PromiseOnlySuccess(detailedReceipts);
      const receiptsData = {
        receipts: finalReceipts as LpReceipt[],
        toBlockTimestamp: finalReceipts[finalReceipts.length - 1]?.blockTimestamp,
      };
      return receiptsData;
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: true,
      shouldRetryOnError: false,
    }
  );

  useError({ error });

  const onFetchNextLpReceipts = useCallback(() => {
    if (isLoading) {
      return;
    }
    setSize(size + 1);
  }, [isLoading, size, setSize]);

  const onRefreshLpReceipts = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    receiptsData,
    onFetchNextLpReceipts,
    onRefreshLpReceipts,
  };
};
