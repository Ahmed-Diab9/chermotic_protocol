import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { Market } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

type OracleWithMarket = OracleVersion & { marketAddress: string };

export const useOracleBefore24Hours = ({ market }: { market?: Market }) => {
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    name: 'getOracleBefore24Hours',
    market,
  };
  const {
    data: oracle,
    error,
    mutate: _mutate,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ market }) => {
    let searchIndex = 0;
    const currentVersion = market.oracleValue.version;
    const oracleProvider = await client.market().contracts().oracleProvider(market.address);
    if (currentVersion <= 0n) {
      return;
    }

    const searchVersion = async (
      minVersion: bigint,
      maxVersion: bigint
    ): Promise<OracleWithMarket> => {
      if (searchIndex > 16) {
        throw new Error('Execution counts exceeded');
      }
      searchIndex++;
      const averageVersion = (minVersion + maxVersion) / 2n;
      const averageOracle = await oracleProvider.read.atVersion([averageVersion]);
      const oracleDiff = Number(market.oracleValue.timestamp - averageOracle.timestamp);
      if (oracleDiff < 60 * 60 * 24) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return searchVersion(minVersion, averageVersion);
      }
      if (oracleDiff > 60 * 60 * 24 + 60 * 10) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return searchVersion(averageVersion, maxVersion);
      }
      return { ...averageOracle, marketAddress: market.address };
    };
    return searchVersion(0n, market.oracleValue.version);
  });

  const { isLoading, changeRate } = useMemo(() => {
    if (isNil(market) || isNil(oracle)) {
      return {
        isLoading: true,
        changeRate: undefined,
      };
    }
    const numerator = market.oracleValue.price - oracle.price;
    return {
      isLoading: false,
      changeRate: divPreserved(numerator, oracle.price, ORACLE_PROVIDER_DECIMALS),
    };
  }, [market, oracle]);

  const refetch = () => {
    _mutate();
  };

  const mutate = (nextOracle: OracleWithMarket) => {
    _mutate(nextOracle);
  };

  useError({ error });

  return {
    oracle,
    changeRate,
    isLoading,
    refetch,
    mutate,
  };
};
