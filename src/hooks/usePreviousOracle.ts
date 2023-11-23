import useSWR from 'swr';
import { Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { trimMarket } from '~/utils/market';
import useMarketOracle from './commons/useMarketOracle';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

interface Props {
  market?: Market;
}

export const usePreviousOracle = ({ market }: Props) => {
  const { isReady, client } = useChromaticClient();
  const { currentOracle } = useMarketOracle({ market });
  const fetchKey = {
    name: 'getPreviousOracleVersion',
    market: trimMarket(market),
    currentOracle,
  };

  const { data: previousOracle, error } = useSWR(
    isReady && checkAllProps(fetchKey) && fetchKey,
    async ({ market, currentOracle }) => {
      const oracleProvider = await client.market().contracts().oracleProvider(market.address);

      if (currentOracle.version <= 0n) {
        return undefined;
      }
      const oracleBefore1Day = await oracleProvider.read.atVersion([currentOracle.version - 1n]);
      if (currentOracle.version <= 1n) {
        return { oracleBefore1Day };
      }
      const oracleBefore2Days = await oracleProvider.read.atVersion([currentOracle.version - 2n]);
      return {
        oracleBefore1Day,
        oracleBefore2Days,
      };
    }
  );

  useError({ error });

  return { previousOracle };
};
