import { iChromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import { watchContractEvent } from '@wagmi/core';
import { isNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';

const receiptAbi = iChromaticLpABI.filter((abi) => abi.type === 'event');
const receiptEvents = [
  'AddLiquidity',
  'AddLiquiditySettled',
  'RemoveLiquidity',
  'RemoveLiquiditySettled',
] as const;

// TODO: Can listen all events from the abi of lp receipts, with one event name only.
const eventName: (typeof receiptEvents)[number] = 'AddLiquidity';

interface UseLpReceiptsUpdate {
  callbacks?: (() => unknown)[];
}

const useLpReceiptsUpdate = (props: UseLpReceiptsUpdate) => {
  const { callbacks } = props;
  const selectedLp = useAppSelector(selectedLpSelector);
  const { address } = useAccount();
  const lpAddress = useMemo(() => {
    return selectedLp?.address;
  }, [selectedLp]);

  useEffect(() => {
    if (isNil(lpAddress)) {
      return;
    }
    const unwatch = watchContractEvent(
      {
        abi: receiptAbi,
        eventName,
        address: lpAddress,
      },
      (logs) => {
        const myLogs = logs.filter((log) => log.args.recipient === address);
        if (myLogs.length !== 0) {
          callbacks?.forEach((callback) => callback());
        }
      }
    );

    return () => {
      unwatch();
    };
  }, [callbacks, lpAddress, address]);
};

export default useLpReceiptsUpdate;
