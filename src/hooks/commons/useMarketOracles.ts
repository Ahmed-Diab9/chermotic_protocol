import { isNil } from 'ramda';
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
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ markets }) => {
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
  });

  useError({ error });

  return { marketOracles, isLoading };
};

export default useMarketOracles;
