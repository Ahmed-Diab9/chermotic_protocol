import { iChromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import axios from 'axios';
import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { decodeEventLog } from 'viem';
import { useAccount } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL } from '~/constants/arbiscan';
import { LpReceiptPartial } from '~/typings/lp';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { useChromaticLp } from './useChromaticLp';
import { useError } from './useError';

export const useLpReceiptCount = () => {
  const { address: walletAddress } = useAccount();
  const { lpList, isLpLoading } = useChromaticLp();
  const lpAddresses = useMemo(() => {
    return lpList?.map((lp) => lp.address);
  }, [lpList]);

  const fetchKey = {
    key: 'getLpReceiptCount',
    lpAddresses,
    walletAddress,
  };
  const {
    data: count,
    error,
    isLoading: isCountLoading,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : null, async ({ lpAddresses, walletAddress }) => {
    let mintings = 0;
    let burnings = 0;
    let inProgresses = 0;
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];

      const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${lpAddress}&page=1&offset=1000&apikey=${ARBISCAN_API_KEY}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      const responseLogs =
        typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
      const reducedReceipts = responseLogs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: iChromaticLpABI.filter(
                ({ type, name }) =>
                  type === 'event' &&
                  (name === 'AddLiquidity' ||
                    name === 'AddLiquiditySettled' ||
                    name === 'RemoveLiquidity' ||
                    name === 'RemoveLiquiditySettled')
              ),
              data: log.data,
              topics: log.topics,
            });
          } catch (error) {
            return undefined;
          }
        })
        .reduce((newMap, decoded) => {
          if (isNil(decoded)) {
            return newMap;
          }
          const {
            eventName,
            args: { receiptId },
          } = decoded;
          const mapValue =
            newMap.get(receiptId) ??
            ({
              id: receiptId,
              isSettled: false,
              isIssued: false,
            } as Partial<LpReceiptPartial>);
          switch (eventName) {
            case 'AddLiquidity': {
              const { receiptId, recipient } = decoded.args;
              mapValue.action = 'minting';
              mapValue.id = receiptId;
              mapValue.recipient = recipient;
              mapValue.isIssued = true;
              break;
            }
            case 'AddLiquiditySettled': {
              mapValue.isSettled = true;
              break;
            }
            case 'RemoveLiquidity': {
              const { receiptId, recipient } = decoded.args;
              mapValue.action = 'burning';
              mapValue.id = receiptId;
              mapValue.recipient = recipient;
              mapValue.isIssued = true;
              break;
            }
            case 'RemoveLiquiditySettled': {
              mapValue.isSettled = true;
              break;
            }
          }
          newMap.set(receiptId, mapValue as LpReceiptPartial);
          return newMap;
        }, new Map<bigint, LpReceiptPartial>());
      const filtered = Array.from(reducedReceipts.values()).filter(
        (receipt) => receipt.recipient === walletAddress
      );
      mintings += filtered.filter((receipt) => receipt.action === 'minting').length;
      burnings += filtered.filter((receipt) => receipt.action === 'burning').length;
      inProgresses += filtered.filter((receipt) => !receipt.isSettled).length;
    }
    return {
      mintings,
      burnings,
      inProgresses,
    };
  });

  useError({ error });

  return {
    count,
    isCountLoading,
  };
};
