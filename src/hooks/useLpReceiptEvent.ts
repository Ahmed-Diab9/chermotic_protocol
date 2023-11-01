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
  const ref = useRef<((() => unknown) | undefined)[]>([]);

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
    if (ref.current.length > 0) {
      return;
    }
    for (let index = 0; index < lpAddresses.length; index++) {
      const lpAddress = lpAddresses[index];
      const unwatch = lpClient.publicClient?.watchEvent({
        address: lpAddress,
        events: receiptAbi,
        onLogs: (logs) => {
          const filteredLogs = logs.filter(
            (log) => isNotNil(log) && 'recipient' in log.args && log.args.recipient === address
          );
          if (filteredLogs.length > 0) {
            dispatchLpReceiptEvent();
          }
        },
      });
      ref.current.push(unwatch);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, lpAddresses, address]);

  useEffect(() => {
    return () => {
      ref.current.forEach((f) => f?.());
    };
  }, []);
};
