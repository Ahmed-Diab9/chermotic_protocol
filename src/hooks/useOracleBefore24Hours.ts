import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { Market } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import useMarketOracle from './commons/useMarketOracle';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

const VERSION_INTERVAL = 700n;

type OracleWithMarket = OracleVersion & { marketAddress: Address };

export const useOracleBefore24Hours = ({ market }: { market?: Market }) => {
  const { isReady, client } = useChromaticClient();
  const { currentOracle } = useMarketOracle({ market });
  const fetchKey = {
    name: 'getOracleBefore24Hours',
    market,
    currentOracle,
  };
  const {
    data: oracle,
    error,
    mutate: _mutate,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ market, currentOracle }) => {
    const oracleProvider = await client.market().contracts().oracleProvider(market.address);

    const endOracle = await oracleProvider.read.atVersion([
      currentOracle.version - VERSION_INTERVAL,
    ]);

    return { ...endOracle, marketAddress: market.address };
  });

  const { isLoading, changeRate } = useMemo(() => {
    if (isNil(currentOracle) || isNil(oracle)) {
      return {
        isLoading: true,
        changeRate: undefined,
      };
    }
    const numerator = currentOracle.price - oracle.price;
    return {
      isLoading: false,
      changeRate: divPreserved(numerator, oracle.price, ORACLE_PROVIDER_DECIMALS),
    };
  }, [currentOracle, oracle]);

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
