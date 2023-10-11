import { iChromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import axios from 'axios';
import { isNil, isNotNil } from 'ramda';
import useSWRInfinite from 'swr/infinite';
import { decodeEventLog } from 'viem';
import { Address, useAccount } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL, BLOCK_CHUNK, PAGE_SIZE } from '~/constants/arbiscan';
import { LpReceipt } from '~/typings/lp';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { divPreserved, formatDecimals } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

type GetLpReceiptByLogParams = {
  currentReceipts: LpReceipt[];
  toBlockNumber: bigint;
  fromBlockNumber: bigint;
  lpAddress: Address;
  walletAddress: Address;
  action: 'all' | 'minting' | 'burning';
};

const getLpReceiptsByLog = async (params: GetLpReceiptByLogParams) => {
  const { currentReceipts, toBlockNumber, fromBlockNumber, lpAddress, walletAddress } = params;
  const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${lpAddress}&fromBlock=${Number(
    fromBlockNumber
  )}&toBlock=${Number(toBlockNumber)}&apikey=${ARBISCAN_API_KEY}`;
  const response = await axios.get(apiUrl);
  const responseData = response.data;
  const responseLogs =
    typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
  const filteredAbi = iChromaticLpABI.filter(
    ({ type, name }) =>
      type === 'event' &&
      (name === 'AddLiquidity' ||
        name === 'AddLiquiditySettled' ||
        name === 'RemoveLiquidity' ||
        name === 'RemoveLiquiditySettled')
  );
  const decodedLogMap = responseLogs
    .map((log) => {
      try {
        const decoded = decodeEventLog({
          abi: filteredAbi,
          data: log.data,
          topics: log.topics,
          strict: false,
        });
        return {
          ...decoded,
          blockNumber: BigInt(log.blockNumber),
        };
      } catch (error) {
        return undefined;
      }
    })
    .reduce(
      (newMap, decoded) => {
        if (isNil(decoded)) {
          return newMap;
        }
        const {
          eventName,
          args: { receiptId },
        } = decoded;
        if (isNil(receiptId)) {
          return newMap;
        }
        const mapValue =
          newMap.get(receiptId) ??
          ({
            id: receiptId,
            isSettled: false,
            isIssued: false,
          } as Partial<LpReceipt>);
        switch (eventName) {
          case 'AddLiquidity': {
            const { receiptId, recipient, amount, oracleVersion } = decoded.args;
            mapValue.action = 'minting';
            mapValue.id = receiptId;
            mapValue.recipient = recipient;
            mapValue.amount = amount;
            mapValue.oracleVersion = oracleVersion;
            mapValue.isIssued = true;

            break;
          }
          case 'AddLiquiditySettled': {
            const { lpTokenAmount, receiptId } = decoded.args;
            mapValue.id = receiptId;
            mapValue.mintedAmount = lpTokenAmount;
            mapValue.isSettled = true;
            mapValue.blockNumber = decoded.blockNumber;
            break;
          }
          case 'RemoveLiquidity': {
            const { receiptId, recipient, lpTokenAmount, oracleVersion } = decoded.args;
            mapValue.action = 'burning';
            mapValue.id = receiptId;
            mapValue.recipient = recipient;
            mapValue.amount = lpTokenAmount;
            mapValue.oracleVersion = oracleVersion;
            mapValue.isIssued = true;
            break;
          }
          case 'RemoveLiquiditySettled': {
            const { receiptId, witdrawnSettlementAmount, refundedAmount } = decoded.args;
            mapValue.id = receiptId;
            mapValue.burnedAmount = witdrawnSettlementAmount;
            mapValue.remainedAmount = refundedAmount;
            mapValue.isSettled = true;
            mapValue.hasReturnedValue = refundedAmount !== 0n;
            mapValue.blockNumber = decoded.blockNumber;
            break;
          }
          default: {
            break;
          }
        }
        newMap.set(receiptId, mapValue as LpReceipt);
        return newMap;
      },
      currentReceipts.reduce((nextMap, currentReceipt) => {
        nextMap.set(currentReceipt.id, currentReceipt);
        return nextMap;
      }, new Map<bigint, LpReceipt>())
    );

  const receiptArray = Array.from(decodedLogMap.values()).filter(
    (receipt) => receipt.recipient === walletAddress
  );
  return { receiptArray, fromBlockNumber };
};

type UseLpReceiptsNext = {
  action: 'all' | 'minting' | 'burning';
};

export const useLpReceipts = (props: UseLpReceiptsNext) => {
  const { isReady, lpClient, client } = useChromaticClient();
  const { address } = useAccount();
  const { currentMarket } = useMarket();
  const { tokens } = useSettlementToken();
  const initialBlockNumber = 1n;
  const { action } = props;

  const {
    data: receiptsData,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousData) => {
      if (!isReady || isNil(initialBlockNumber)) {
        return null;
      }
      if (previousData && !previousData.receipts) {
        return null;
      }
      if (previousData && previousData.toBlockNumber < initialBlockNumber) {
        return null;
      }
      const fetchKey = {
        key: 'getChromaticLpReceipts',
        walletAddress: address,
        currentMarket,
        tokens,
        action,
        initialBlockNumber,
        pageIndex,
      };
      if (!checkAllProps(fetchKey)) {
        return null;
      }
      if (previousData?.toBlockNumber < initialBlockNumber) {
        return null;
      }
      return {
        ...fetchKey,
        toBlockNumber: previousData?.toBlockNumber as bigint | undefined,
      };
    },
    async ({ walletAddress, tokens, currentMarket, action, initialBlockNumber, toBlockNumber }) => {
      if (isNil(toBlockNumber)) {
        toBlockNumber = await client.publicClient?.getBlockNumber();
        if (isNil(toBlockNumber)) {
          throw new Error('Invalid block number bounds');
        }
      }
      let totalReceipts = [] as LpReceipt[];
      let fromBlockNumber: bigint =
        toBlockNumber - BLOCK_CHUNK > initialBlockNumber
          ? toBlockNumber - BLOCK_CHUNK
          : initialBlockNumber;
      const registry = lpClient.registry();
      const lpAddresses = await registry.lpListByMarket(currentMarket.address);
      while (true) {
        let currentReceipts = totalReceipts.slice();
        for (let index = 0; index < lpAddresses.length; index++) {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(undefined!);
            }, 1000);
          });
          const lpAddress = lpAddresses[index];
          const lp = lpClient.lp();
          const settlementToken = tokens.find(
            (token) => token.address === currentMarket.tokenAddress
          );
          const clpToken = await lp.lpTokenMeta(lpAddress);
          const { receiptArray } = await getLpReceiptsByLog({
            currentReceipts,
            toBlockNumber,
            fromBlockNumber,
            lpAddress,
            walletAddress,
            action,
          });
          const detailedReceipts = receiptArray.map(async (receipt) => {
            const status =
              receipt.oracleVersion < currentMarket.oracleValue.version ? 'completed' : 'standby';
            let detail = '';
            const token = {
              name: receipt.action === 'minting' ? clpToken?.symbol : settlementToken?.name,
              decimals:
                receipt.action === 'minting' ? clpToken.decimals : settlementToken?.decimals,
              logo: receipt.action === 'burning' ? settlementToken?.image : undefined,
            };

            if (status === 'completed' && receipt.action === 'minting' && receipt.isSettled) {
              detail =
                formatDecimals(receipt.mintedAmount, token.decimals, 2, true) + ' ' + token.name;
            }

            if (status === 'completed' && receipt.action === 'burning' && receipt.isSettled) {
              detail =
                formatDecimals(receipt.burnedAmount, token.decimals, 2, true) + ' ' + token.name;
            }
            let message = status === 'standby' ? 'Waiting for the next oracle round' : 'Completed';
            const key = `${action}-receipt-${receipt.id}-${receipt.action}-${status}`;

            if (receipt.action === 'burning' && receipt.remainedAmount > 0n) {
              const dividedByAmount = divPreserved(
                receipt.remainedAmount,
                receipt.amount,
                clpToken.decimals
              );
              const returnedRatio = formatDecimals(
                dividedByAmount * 100n,
                clpToken.decimals,
                2,
                true
              );
              message = `${returnedRatio}% withdrawn`;
            }
            const remainedDetail = isNotNil(receipt.remainedAmount)
              ? formatDecimals(receipt.remainedAmount, clpToken.decimals, 2, true)
              : undefined;

            const oracleProvider = await client
              .market()
              .contracts()
              .oracleProvider(currentMarket.address);
            const oracleValue = await oracleProvider.read.atVersion([receipt.oracleVersion]);
            const { timestamp } = oracleValue;

            return {
              ...receipt,
              key,
              status,
              message,
              detail: [detail, remainedDetail],

              timestamp,
              token,
            } satisfies LpReceipt;
          });
          currentReceipts = await PromiseOnlySuccess(detailedReceipts);
        }
        currentReceipts.sort((previous, next) => {
          if (isNil(previous.blockNumber) && isNil(next.blockNumber)) {
            return 0;
          }
          if (isNil(previous.blockNumber) && isNotNil(next.blockNumber)) {
            return 1;
          }
          if (isNil(previous.blockNumber) && isNil(next.blockNumber)) {
            return -1;
          }
          return previous.blockNumber < next.blockNumber ? 1 : -1;
        });
        const filteredReceipts = currentReceipts.filter(
          (receipt) =>
            receipt.isIssued &&
            (receipt.action === action || action === 'all') &&
            walletAddress === receipt.recipient
        );
        if (filteredReceipts.length < PAGE_SIZE) {
          totalReceipts = currentReceipts;
          if (fromBlockNumber === initialBlockNumber) {
            break;
          }
          fromBlockNumber =
            fromBlockNumber - BLOCK_CHUNK > initialBlockNumber
              ? fromBlockNumber - BLOCK_CHUNK
              : initialBlockNumber;
          continue;
        }
        if (filteredReceipts.length >= PAGE_SIZE) {
          const slicedReceipts = filteredReceipts.slice(0, PAGE_SIZE);
          totalReceipts = slicedReceipts;
          const lastSettled = slicedReceipts.findLast((receipt) => isNotNil(receipt.blockNumber));
          if (isNotNil(lastSettled)) {
            fromBlockNumber = lastSettled.blockNumber;
          } else {
            fromBlockNumber = slicedReceipts[slicedReceipts.length - 1].blockNumber;
          }
          break;
        }
      }
      return {
        receipts: totalReceipts,
        toBlockNumber: fromBlockNumber - 1n,
      };
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const onFetchNextLpReceipts = () => {
    setSize((size) => size + 1);
  };

  useError({ error });

  return {
    receiptsData,
    onFetchNextLpReceipts,
  };
};
