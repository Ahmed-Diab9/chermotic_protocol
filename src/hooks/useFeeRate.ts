import useSWR from 'swr';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

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
