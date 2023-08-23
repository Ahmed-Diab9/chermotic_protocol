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
      const previousOracle = await oracleProvider.read.atVersion([currentVersion - 1n]);

      return previousOracle;
    }
  );

  useError({ error });

  return { previousOracle };
};
