import useSWR from 'swr';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { checkAllProps } from '../utils';
import { useSettlementToken } from './useSettlementToken';

// 연이율은 소수점 4자리를 적용해야 합니다. @austin-builds
export const useFeeRate = () => {
  const { isReady, client } = useChromaticClient();
  const { currentToken } = useSettlementToken();

  const fetchKey = {
    name: 'useFeeRate',
    tokenAddress: currentToken?.address,
  };
  const {
    data: feeRate,
    error,
    isLoading: isFeeRateLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ tokenAddress }) => {
    const marketFactoryApi = client.marketFactory();

    return (await marketFactoryApi?.currentInterestRate(tokenAddress)) || 0n;
  });

  useError({ error });

  return { feeRate, isFeeRateLoading };
};
