import { useMemo } from 'react';
import useSWR from 'swr';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';

type OracleWithMarket = OracleVersion & { marketAddress: string };

export const useBeforeDayOracles = () => {
  const { markets, currentMarket } = useMarket();
  const { isReady, client } = useChromaticClient();
  const fetchBeforeDayKey = {
    name: 'getBeforeDayOracle',
    markets,
  };

  const {
    data: oracles,
    error,
    isLoading,
    mutate: _mutate,
  } = useSWR(
    isReady && checkAllProps(fetchBeforeDayKey) && fetchBeforeDayKey,
    async ({ markets }) => {
      const response = await Promise.allSettled(
        markets.map(async (market) => {
          let searchIndex = 0;
          const currentVersion = market.oracleValue.version;
          const oracleProvider = await client.market().contracts().oracleProvider(market.address);

          if (currentVersion <= 0n) {
            return undefined;
          }
          const func = async (
            minVersion: bigint,
            maxVersion: bigint
          ): Promise<OracleWithMarket> => {
            if (searchIndex > 16) {
              throw new Error('Execution count exceeded');
            }
            searchIndex++;
            const averageVersion = (minVersion + maxVersion) / 2n;
            const averageOracle = await oracleProvider.read.atVersion([averageVersion]);
            const oracleDiff = Number(market.oracleValue.timestamp - averageOracle.timestamp);
            if (oracleDiff < 60 * 60 * 24 - 60 * 10) {
              return func(minVersion, averageVersion);
            }
            if (oracleDiff > 60 * 60 * 24) {
              return func(averageVersion, maxVersion);
            }
            return { ...averageOracle, marketAddress: market.address };
          };

          return func(0n, market.oracleValue.version);
        })
      );

      return response
        .filter(
          (value): value is PromiseFulfilledResult<OracleWithMarket | undefined> =>
            value.status === 'fulfilled'
        )
        .map(({ value }) => value);
    }
  );

  const oracle = useMemo(() => {
    return oracles?.find((oracleValue) => oracleValue?.marketAddress === currentMarket?.address);
  }, [oracles, currentMarket]);

  useError({ error });

  const refetch = () => {
    _mutate();
  };

  const mutate = (nextOracles: OracleWithMarket[]) => {
    _mutate(nextOracles);
  };

  return {
    oracles,
    oracle,
    isLoading,
    refetch,
    mutate,
  };
};
