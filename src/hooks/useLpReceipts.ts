/**
 * When encountering error `Cannot find module, or type declarations`, Run codegen with `yarn codegen`
 * @austin-builds
 */

import { Client } from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { TransactionReceipt } from 'viem';
import { Address, useAccount } from 'wagmi';
import { PAGE_SIZE } from '~/constants/arbiscan';
import { lpGraphSdk } from '~/lib/graphql';
import {
  AddLiquidity_OrderBy,
  OrderDirection,
  RemoveLiquidity_OrderBy,
  Sdk,
} from '~/lib/graphql/sdk/lp';
import { useAppDispatch, useAppSelector } from '~/store';
import { receiptActionSelector, selectedLpSelector } from '~/store/selector';
import { LpReceipt, LpToken, ReceiptAction } from '~/typings/lp';
import { Market, Token } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { trimMarket } from '~/utils/market';
import { bigintify, divPreserved, formatDecimals } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import useMarkets from './commons/useMarkets';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

type GetReceiptsArgs = {
  count: number;
  walletAddress: Address;
  lpAddress: Address;
  toBlockTimestamp: bigint;
};

type ReceiptsData = {
  receipts: LpReceipt[];
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
    const { receiptId, withdrawnSettlementAmount, refundedAmount } = bigintify(
      current,
      'receiptId',
      'withdrawnSettlementAmount',
      'refundedAmount'
    );
    map.set(receiptId, {
      id: receiptId,
      burnedAmount: withdrawnSettlementAmount,
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
  currentMarket: Market;
  currentAction: ReceiptAction;
  settlementToken: Token;
  clpMeta: LpToken;
};

const mapToDetailedReceipts = async (args: MapToDetailedReceiptsArgs) => {
  const { client, receipts, currentAction, currentMarket, settlementToken, clpMeta } = args;
  const detailedReceipts = receipts.map(async (receipt) => {
    const status = receipt.isIssued && receipt.isSettled ? 'completed' : 'standby';
    let detail = '';
    const token = {
      name: receipt.action === 'minting' ? clpMeta?.symbol : settlementToken?.name,
      decimals: receipt.action === 'minting' ? clpMeta.decimals : settlementToken?.decimals,
      logo: receipt.action === 'burning' ? settlementToken?.image : clpMeta.image,
    };

    if (status === 'completed' && receipt.action === 'minting' && receipt.isSettled) {
      detail = formatDecimals(receipt.mintedAmount, token.decimals, 2, true) + ' CLP';
    }

    if (status === 'completed' && receipt.action === 'burning' && receipt.isSettled) {
      detail = formatDecimals(receipt.burnedAmount, token.decimals, 2, true) + ' ' + token.name;
    }
    let message = status === 'standby' ? 'Waiting for the next oracle round' : 'Completed';
    const key = `${token.name}:receipt:${receipt.id}:${receipt.action}:${status}:${currentAction}`;

    if (receipt.action === 'burning' && receipt.remainedAmount > 0n) {
      const dividedByAmount = divPreserved(
        receipt.remainedAmount,
        receipt.amount,
        clpMeta.decimals
      );
      const returnedRatio = formatDecimals(dividedByAmount * 100n, clpMeta.decimals, 2, true);
      message = `${returnedRatio}% withdrawn`;
    }
    const remainedDetail = isNotNil(receipt.remainedAmount)
      ? formatDecimals(receipt.remainedAmount, clpMeta.decimals, 2, true)
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

export const useLpReceipts = () => {
  const { isReady, lpClient, client } = useChromaticClient();
  const { address } = useAccount();
  const { currentMarket } = useMarkets();
  const { tokens } = useSettlementToken();
  const selectedLp = useAppSelector(selectedLpSelector);
  const receiptAction = useAppSelector(receiptActionSelector);
  const dispatch = useAppDispatch();
  const clpMeta = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    const { clpName, clpSymbol, clpDecimals, image, address } = selectedLp;
    const metadata = {
      name: clpName,
      symbol: clpSymbol,
      decimals: clpDecimals,
      image,
      address,
    } satisfies LpToken;
    return metadata;
  }, [selectedLp]);

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
        receiptAction,
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
      receiptAction,
      toBlockTimestamp,
      pageIndex,
    }) => {
      const defaultToBlockTimestamp = BigInt(Math.round(Date.now() / 1000));
      const settlementToken = tokens.find((token) => token.address === currentMarket.tokenAddress);
      if (isNil(settlementToken)) {
        throw new Error('Tokens invalid');
      }

      const count = pageIndex === 0 ? 2 : PAGE_SIZE;
      let receipts: LpReceipt[] = [];

      let currentReceipts = [] as LpReceipt[];
      if (receiptAction !== 'burning') {
        const addMap = await getAddReceipts(lpGraphSdk, {
          count,
          walletAddress,
          lpAddress: clpMeta.address,
          toBlockTimestamp: toBlockTimestamp ?? defaultToBlockTimestamp,
        });
        currentReceipts = currentReceipts.concat(Array.from(addMap.values()));
      }
      if (receiptAction !== 'minting') {
        const removeMap = await getRemoveReceipts(lpGraphSdk, {
          count,
          walletAddress,
          lpAddress: clpMeta.address,
          toBlockTimestamp: toBlockTimestamp ?? defaultToBlockTimestamp,
        });
        currentReceipts = currentReceipts.concat(Array.from(removeMap.values()));
      }
      receipts = receipts.concat(currentReceipts);
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
        currentAction: receiptAction,
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
      // TODO: Find proper interval seconds
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

  const onMutateLpReceipts = useCallback(
    async (
      tx: TransactionReceipt,
      lpAddress: Address,
      action: 'minting' | 'burning',
      timestamp: bigint
    ) => {
      const { transactionHash, blockNumber } = tx;
      const key = `new:${transactionHash}:receipt:${action}:standby:${receiptAction}`;
      const newPendingReceipt = {
        key,
        id: -1n,
        lpAddress,
        hasReturnedValue: false,
        isIssued: true,
        isSettled: false,
        recipient: address,
        status: 'standby',
        action,
        message: 'Waiting for the next oracle round',
        detail: ['', ''],
        blockTimestamp: timestamp,
        blockNumber,
        token: {},
      } as LpReceipt;
      if (isNil(receiptsData)) {
        return mutate([{ receipts: [newPendingReceipt], toBlockTimestamp: timestamp }], {
          revalidate: false,
        });
      }
      const flattenData = receiptsData.map(({ receipts }) => receipts).flat(1);
      flattenData.unshift(newPendingReceipt);
      const mutated = flattenData.reduce((mutatedData, _, index) => {
        if (index !== 0 && (index - 2) % 5 !== 0) {
          return mutatedData;
        }
        const size = index === 0 ? 2 : 5;
        const receipts = flattenData.slice(index, size);
        if (receipts.length === 0) {
          return mutatedData;
        }
        mutatedData = mutatedData.concat({
          receipts,
          toBlockTimestamp: receipts[0].blockTimestamp,
        });
        return mutatedData;
      }, [] as ReceiptsData[]);
      mutate(mutated, { revalidate: false });
    },
    [receiptAction, address, receiptsData, mutate]
  );

  return {
    receiptsData,
    isReceiptsLoading: isLoading,
    onFetchNextLpReceipts,
    onRefreshLpReceipts,
    onMutateLpReceipts,
  };
};
