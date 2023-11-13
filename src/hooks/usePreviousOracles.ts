import useSWR from 'swr';
import { Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

interface Props {
  markets?: Market[];
}

export const usePreviousOracles = ({ markets }: Props) => {
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    name: 'getPreviousOracleVersions',
    markets,
  };
  const {
    data: previousOracles,
    error,
    isLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ markets }) => {
    const response = await PromiseOnlySuccess(
      markets.map(async (market) => {
        const currentVersion = market.oracleValue.version;
        const oracleProvider = await client.market().contracts().oracleProvider(market.address);
        if (currentVersion <= 0n) {
          return undefined;
        }
        const previousOracle = await oracleProvider.read.atVersion([currentVersion - 1n]);
        return { ...previousOracle, marketAddress: market.address };
      })
    );

    return response;
  });

  useError({ error });

  return { previousOracles, isLoading };
};
