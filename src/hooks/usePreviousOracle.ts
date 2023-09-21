import useSWR from 'swr';
import { Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

interface Props {
  market?: Market;
}

export const usePreviousOracle = ({ market }: Props) => {
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    name: 'getPreviousOracleVersion',
    market,
  };

  const { data: previousOracle, error } = useSWR(
    isReady && checkAllProps(fetchKey) && fetchKey,
    async ({ market }) => {
      const currentVersion = market.oracleValue.version;
      const oracleProvider = await client.market().contracts().oracleProvider(market.address);

      if (currentVersion <= 0n) {
        return undefined;
      }
      const oracleBefore1Day = await oracleProvider.read.atVersion([currentVersion - 1n]);
      if (currentVersion <= 1n) {
        return { oracleBefore1Day };
      }
      const oracleBefore2Days = await oracleProvider.read.atVersion([currentVersion - 2n]);
      return {
        oracleBefore1Day,
        oracleBefore2Days,
      };
    }
  );

  useError({ error });

  return { previousOracle };
};
