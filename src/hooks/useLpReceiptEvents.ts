import { iChromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import { useContractEvent } from 'wagmi';
import { useAppSelector } from '~/store';

export interface UseLpReceiptEvents {
  callbacks: (() => unknown)[];
}

export const useLpReceiptEvents = (props: UseLpReceiptEvents) => {
  const { callbacks } = props;
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  useContractEvent({
    address: selectedLp?.address,
    abi: iChromaticLpABI,
    eventName: 'AddLiquidity',
    listener: (logs) => {
      if (logs.length > 0 && logs[0].eventName === 'AddLiquidity') {
        callbacks.forEach((listener) => listener());
      }
    },
  });
  useContractEvent({
    address: selectedLp?.address,
    abi: iChromaticLpABI,
    eventName: 'AddLiquiditySettled',
    listener: (logs) => {
      if (logs.length > 0 && logs[0].eventName === 'AddLiquiditySettled') {
        callbacks.forEach((listener) => listener());
      }
    },
  });
  useContractEvent({
    address: selectedLp?.address,
    abi: iChromaticLpABI,
    eventName: 'RemoveLiquidity',
    listener: (logs) => {
      if (logs.length > 0 && logs[0].eventName === 'RemoveLiquidity') {
        callbacks.forEach((listener) => listener());
      }
    },
  });
  useContractEvent({
    address: selectedLp?.address,
    abi: iChromaticLpABI,
    eventName: 'RemoveLiquiditySettled',
    listener: (logs) => {
      if (logs.length > 0 && logs[0].eventName === 'RemoveLiquiditySettled') {
        callbacks.forEach((listener) => listener());
      }
    },
  });
};
