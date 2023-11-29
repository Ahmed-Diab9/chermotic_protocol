import { isNil } from 'ramda';
import { useCallback } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { Market } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { promiseIfFulfilled } from '~/utils/promise';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';

interface UseMarketOracles {
  markets?: Market[];
}

const useMarketOracles = (props: UseMarketOracles) => {
  const { markets } = props;
  const { client } = useChromaticClient();

  const fetchKey = {
    key: 'useMarketOracles',
    markets,
  };

  const {
    data: marketOracles,
    error,
    isLoading,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ markets }) => {
      const marketApi = client.market();
      const oracleProviders = await promiseIfFulfilled(
        markets.map(async (market) => marketApi.contracts().oracleProvider(market.address))
      );
      const currentOracles = await promiseIfFulfilled(
        oracleProviders.map(async (oracleProvider, providerIndex) => {
          if (isNil(oracleProvider)) {
            return;
          }
          const currentOracle = await oracleProvider.read.currentVersion();
          return currentOracle;
        })
      );
      return markets.reduce((oracles, market, marketIndex) => {
        oracles[market.address] = currentOracles[marketIndex];

        return oracles;
      }, {} as Record<Address, OracleVersion | undefined>);
    },
    {
      refreshInterval: 0,
    }
  );

  useError({ error });

  const refreshMarketOracles = useCallback(() => {
    mutate();
  }, [mutate]);

  const mutateMarketOracles = useCallback(
    async (marketAddress: Address) => {
      if (isNil(client) || isNil(marketOracles)) {
        return;
      }
      const oracleProvider = await client.market().contracts().oracleProvider(marketAddress);
      const nextOracle = await oracleProvider.read.currentVersion();
      const nextOracles = {
        ...marketOracles,
        [marketAddress]: nextOracle,
      };
      await mutate(nextOracles, { revalidate: false });
    },
    [client, marketOracles, mutate]
  );

  return { marketOracles, isLoading, refreshMarketOracles, mutateMarketOracles };
};

export default useMarketOracles;
