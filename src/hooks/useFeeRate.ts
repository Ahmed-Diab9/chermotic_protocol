import { useMemo } from 'react';
import useSWR from 'swr';
import { useChromaticClient } from './useChromaticClient';
import { useAppSelector } from '../store';
import { useError } from './useError';
import { checkAllProps } from '../utils';

// 연이율은 소수점 4자리를 적용해야 합니다. @austin-builds
export const useFeeRate = () => {
  const { marketFactoryApi } = useChromaticClient();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);

  const fetchKeyData = {
    name: 'useFeeRate',
    tokenAddress: selectedToken?.address,
  };
  const {
    data: feeRate,
    error,
    isLoading: isFeeRateLoading,
  } = useSWR(checkAllProps(fetchKeyData) ? fetchKeyData : null, async ({ tokenAddress }) => {
    return (await marketFactoryApi?.currentInterestRate(tokenAddress)) || 0n;
  });

  useError({ error });

  return { feeRate, isFeeRateLoading };
};
