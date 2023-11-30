import { useCallback } from 'react';
import useSWR from 'swr';
import { Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';

interface UseMarketOracle {
  market?: Market;
}

const useMarketOracle = (props: UseMarketOracle) => {
  const { market } = props;
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    key: 'useMarketOracle',
    market,
  };
  const {
    data: currentOracle,
    isLoading,
    error,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ market }) => {
      const oracleProvider = await client.market().contracts().oracleProvider(market.address);
      const currentOracle = await oracleProvider.read.currentVersion();

      return currentOracle;
    },
    {
      refreshInterval: 0,
    }
  );

  useError({ error });

  const refreshMarketOracle = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return { currentOracle, isLoading, refreshMarketOracle };
};

export default useMarketOracle;
