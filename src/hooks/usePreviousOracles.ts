import { isNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { Market } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { promiseIfFulfilled } from '~/utils/promise';
import useMarketOracles from './commons/useMarketOracles';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

interface Props {
  markets?: Market[];
}

export const usePreviousOracles = ({ markets }: Props) => {
  const { isReady, client } = useChromaticClient();
  const { marketOracles } = useMarketOracles({ markets });
  const fetchKey = {
    name: 'getPreviousOracleVersions',
    marketOracles,
  };
  const {
    data: previousOracles,
    error,
    isLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ marketOracles }) => {
    const marketApi = client.market();
    const oracleProviders = await promiseIfFulfilled(
      Object.keys(marketOracles).map(async (marketAddress) => {
        return marketApi.contracts().oracleProvider(marketAddress as Address);
      })
    );
    const previousOracles = await promiseIfFulfilled(
      Object.values(marketOracles).map(async (marketOracle, index) => {
        if (isNil(marketOracle) || marketOracle.version < 1n) {
          return;
        }
        const previousOracle = await oracleProviders[index]?.read.atVersion([
          marketOracle.version - 1n,
        ]);
        return previousOracle;
      })
    );

    return Object.keys(marketOracles).reduce((oracles, marketAddress, currentIndex) => {
      oracles[marketAddress as Address] = previousOracles[currentIndex];

      return oracles;
    }, {} as Record<Address, OracleVersion | undefined>);
  });

  useError({ error });

  return { previousOracles, isLoading };
};
