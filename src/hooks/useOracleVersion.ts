import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useProvider } from 'wagmi';
import { OracleVersion } from '~/typings/oracleVersion';
import { Logger, errorLog } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
const logger = Logger('useOracleVersion')
const useOracleVersion = () => {
  const { markets } = useMarket();
  const { address } = useAccount();
  const { client } = useChromaticClient();

  const marketApi = useMemo(() => {
    return client?.market();
  }, [client]);
  const provider = useProvider();
  const marketAddresses = (markets ?? []).map((market) => market.address);

  const {
    data: oracleVersions,
    error,
    mutate: fetchOracleVersions,
  } = useSWR(['ORACLE_VERSION', address, ...marketAddresses], async () => {
    logger.log('Market', markets, ...marketAddresses);
    if (!marketApi) return {};

    const oraclePrices = await marketApi.getCurrentPrices(marketAddresses);
    oraclePrices.reduce((record, { market, value }) => {
      const { version, timestamp, price } = value;
      record[market] = {
        version,
        timestamp,
        price,
        decimals: 18,
      };
      return record;
    }, {} as Record<string, OracleVersion & { decimals: number }>);
  });

  if (error) {
    errorLog(error);
  }

  return { oracleVersions, fetchOracleVersions };
};

export default useOracleVersion;
