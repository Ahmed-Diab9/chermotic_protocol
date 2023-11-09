import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { Market } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { trimMarket } from '~/utils/market';
import { divPreserved } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

const VERSION_INTERVAL = 700n;

type OracleWithMarket = OracleVersion & { marketAddress: Address };

export const useOracleBefore24Hours = ({ market }: { market?: Market }) => {
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    name: 'getOracleBefore24Hours',
    market: trimMarket(market),
  };
  const {
    data: oracle,
    error,
    mutate: _mutate,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ market: trimmedMarket }) => {
    const marketOracle = await client.market().getCurrentPrice(trimmedMarket.address);
    const oracleProvider = await client.market().contracts().oracleProvider(trimmedMarket.address);

    const endOracle = await oracleProvider.read.atVersion([
      marketOracle.version - VERSION_INTERVAL,
    ]);

    return { ...endOracle, marketAddress: trimmedMarket.address };
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
