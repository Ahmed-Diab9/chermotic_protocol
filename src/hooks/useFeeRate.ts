import { useMemo } from 'react';
import useSWR from 'swr';
import { useChromaticClient } from './useChromaticClient';
import { useAppSelector } from '../store';
import { errorLog } from '~/utils/log';
import { BigNumber } from 'ethers';

// 연이율은 소수점 4자리를 적용해야 합니다. @austin-builds
export const useFeeRate = () => {
  const { client } = useChromaticClient();
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);
  const selectedToken = useAppSelector((state) => state.token.selectedToken);

  const {
    data: feeRate,
    error,
    isLoading: isFeeRateLoading,
  } = useSWR(['FEE_RATE', selectedToken?.address], async () => {
    if (selectedToken?.address)
      return await marketFactoryApi?.currentInterestRate(selectedToken?.address);
    return BigNumber.from(0);
  });

  if (error) {
    errorLog(error);
  }

  return { feeRate, isFeeRateLoading };
};
