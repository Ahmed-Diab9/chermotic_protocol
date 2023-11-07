import { iChromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { dispatchLpReceiptEvent } from '~/typings/events';
import { useChromaticClient } from './useChromaticClient';
import { useChromaticLp } from './useChromaticLp';

const receiptAbi = iChromaticLpABI
  .map((abi) => {
    const { type, name } = abi;
    if (type !== 'event') {
      return null;
    }
    switch (name) {
      case 'AddLiquidity':
      case 'AddLiquiditySettled':
      case 'RemoveLiquidity':
      case 'RemoveLiquiditySettled': {
        return abi;
      }
      default: {
        return null;
      }
    }
  })
  .filter((abi): abi is NonNullable<Exclude<typeof abi, null>> => isNotNil(abi));

export const useLpReceiptEvent = () => {
  const { lpClient, isReady } = useChromaticClient();
  const { lpList } = useChromaticLp();
  const { address } = useAccount();
  const addLiquidityRef = useRef<((() => unknown) | undefined)[]>([]);
  const addLiquiditySettledRef = useRef<((() => unknown) | undefined)[]>([]);
  const removeLiquidityRef = useRef<((() => unknown) | undefined)[]>([]);
  const removeLiquiditySettledRef = useRef<((() => unknown) | undefined)[]>([]);

  const lpAddresses = useMemo(() => {
    if (isNil(lpList)) {
      return [];
    }
    return lpList?.map((lp) => lp.address);
  }, [lpList]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (lpAddresses.length === 0) {
      return;
    }
    if (addLiquidityRef.current.length > 0) {
      return;
    }
    if (addLiquiditySettledRef.current.length > 0) {
      return;
    }
    if (removeLiquidityRef.current.length > 0) {
      return;
    }
    if (removeLiquiditySettledRef.current.length > 0) {
      return;
    }
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];
      const unwatch = lpClient.publicClient?.watchContractEvent({
        address: lpAddress,
        abi: receiptAbi,
        eventName: 'AddLiquidity',
        onLogs: (logs) => {
          const filteredLogs = logs.filter(
            (log) =>
              isNotNil(log) &&
              log.eventName === 'AddLiquidity' &&
              'recipient' in log.args &&
              log.args.recipient === address
          );
          if (filteredLogs.length > 0) {
            dispatchLpReceiptEvent();
          }
        },
      });
      addLiquidityRef.current.push(unwatch);
    }
  }, [isReady, lpAddresses, address]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (lpAddresses.length === 0) {
      return;
    }
    if (addLiquiditySettledRef.current.length > 0) {
      return;
    }
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];
      const unwatch = lpClient.publicClient?.watchContractEvent({
        address: lpAddress,
        abi: receiptAbi,
        eventName: 'AddLiquiditySettled',
        onLogs: (logs) => {
          const filteredLogs = logs.filter(
            (log) =>
              isNotNil(log) &&
              log.eventName === 'AddLiquiditySettled' &&
              'recipient' in log.args &&
              log.args.recipient === address
          );
          if (filteredLogs.length > 0) {
            dispatchLpReceiptEvent();
          }
        },
      });
      addLiquiditySettledRef.current.push(unwatch);
    }
  }, [isReady, lpAddresses, address]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (lpAddresses.length === 0) {
      return;
    }
    if (removeLiquidityRef.current.length > 0) {
      return;
    }
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];
      const unwatch = lpClient.publicClient?.watchContractEvent({
        address: lpAddress,
        abi: receiptAbi,
        eventName: 'RemoveLiquidity',
        onLogs: (logs) => {
          const filteredLogs = logs.filter(
            (log) =>
              isNotNil(log) &&
              log.eventName === 'RemoveLiquidity' &&
              'recipient' in log.args &&
              log.args.recipient === address
          );
          if (filteredLogs.length > 0) {
            dispatchLpReceiptEvent();
          }
        },
      });
      removeLiquidityRef.current.push(unwatch);
    }
  }, [isReady, lpAddresses, address]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (lpAddresses.length === 0) {
      return;
    }
    if (removeLiquiditySettledRef.current.length > 0) {
      return;
    }
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];
      const unwatch = lpClient.publicClient?.watchContractEvent({
        address: lpAddress,
        abi: receiptAbi,
        eventName: 'RemoveLiquiditySettled',
        onLogs: (logs) => {
          const filteredLogs = logs.filter(
            (log) =>
              isNotNil(log) &&
              log.eventName === 'RemoveLiquiditySettled' &&
              'recipient' in log.args &&
              log.args.recipient === address
          );
          if (filteredLogs.length > 0) {
            dispatchLpReceiptEvent();
          }
        },
      });
      removeLiquiditySettledRef.current.push(unwatch);
    }
  }, [isReady, lpAddresses, address]);

  useEffect(() => {
    return () => {
      addLiquidityRef.current.forEach((cleanup) => cleanup?.());
      addLiquiditySettledRef.current.forEach((cleanup) => cleanup?.());
      removeLiquidityRef.current.forEach((cleanup) => cleanup?.());
      removeLiquiditySettledRef.current.forEach((cleanup) => cleanup?.());
    };
  }, []);
};
