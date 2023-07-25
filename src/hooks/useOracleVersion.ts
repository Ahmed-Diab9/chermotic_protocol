import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { OracleVersion } from '~/typings/oracleVersion';
import { Logger } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
import { useError } from './useError';
import { checkAllProps } from '../utils';

const logger = Logger('useOracleVersion');
const useOracleVersion = () => {
  const { markets } = useMarket();
  const { address } = useAccount();
  const { marketApi } = useChromaticClient();

  // const marketApi = useMemo(() => {
  //   return client?.market();
  // }, [client]);
  // const marketAddresses = (markets ?? []).map((market) => market.address);
  const fetchKeyData = {
    name: 'getOracleVersion',
    marketApi,
    marketAddresses: useMemo(() => (markets ?? []).map((market) => market.address), [markets]),
    address: address,
  };
  const {
    data: oracleVersions,
    error,
    mutate: fetchOracleVersions,
  } = useSWR(
    checkAllProps(fetchKeyData) ? fetchKeyData : null,
    async ({ marketApi, marketAddresses }) => {
      logger.log('Market', markets, ...marketAddresses);
      if (!marketApi) return {};

      const oraclePrices = await marketApi.getCurrentPrices(marketAddresses);
      return oraclePrices.reduce((record, { market, value }) => {
        const { version, timestamp, price } = value;
        record[market] = {
          version,
          timestamp,
          price,
          decimals: 18,
        };
        return record;
      }, {} as Record<string, OracleVersion & { decimals: number }>);
    },
    {
      refreshInterval: 1000 * 30,
    }
  );

  useError({ error, logger });

  return { oracleVersions, fetchOracleVersions };
};

export default useOracleVersion;
