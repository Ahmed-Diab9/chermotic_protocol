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

// TODO: Use hooks in v2 frontend
// export const useBeforeDayOracles = () => {
//   const { markets, currentMarket } = useMarket();
//   const { isReady, client } = useChromaticClient();
//   const fetchBeforeDayKey = {
//     name: 'getBeforeDayOracle',
//     markets,
//   };

//   const {
//     data: oracles,
//     error,
//     isLoading,
//     mutate: _mutate,
//   } = useSWR(
//     isReady && checkAllProps(fetchBeforeDayKey) && fetchBeforeDayKey,
//     async ({ markets }) => {
//       const response = await Promise.allSettled(
//         markets.map(async (market) => {
//           let searchIndex = 0;
//           const currentVersion = market.oracleValue.version;
//           const oracleProvider = await client.market().contracts().oracleProvider(market.address);

//           if (currentVersion <= 0n) {
//             return undefined;
//           }
//           const func = async (
//             minVersion: bigint,
//             maxVersion: bigint
//           ): Promise<OracleWithMarket> => {
//             if (searchIndex > 16) {
//               throw new Error('Execution count exceeded');
//             }
//             searchIndex++;
//             const averageVersion = (minVersion + maxVersion) / 2n;
//             const averageOracle = await oracleProvider.read.atVersion([averageVersion]);
//             const oracleDiff = Number(market.oracleValue.timestamp - averageOracle.timestamp);
//             if (oracleDiff < 60 * 60 * 24) {
//               return func(minVersion, averageVersion);
//             }
//             if (oracleDiff > 60 * 60 * 24 + 60 * 10) {
//               return func(averageVersion, maxVersion);
//             }
//             return { ...averageOracle, marketAddress: market.address };
//           };

//           return func(0n, market.oracleValue.version);
//         })
//       );

//       return response
//         .filter(
//           (value): value is PromiseFulfilledResult<OracleWithMarket | undefined> =>
//             value.status === 'fulfilled'
//         )
//         .map(({ value }) => value);
//     }
//   );

//   const oracle = useMemo(() => {
//     return oracles?.find((oracleValue) => oracleValue?.marketAddress === currentMarket?.address);
//   }, [oracles, currentMarket]);

//   useError({ error });

//   const refetch = () => {
//     _mutate();
//   };

//   const mutate = (nextOracles: OracleWithMarket[]) => {
//     _mutate(nextOracles);
//   };

//   return {
//     oracles,
//     oracle,
//     isLoading,
//     refetch,
//     mutate,
//   };
// };

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
        return searchVersion(minVersion, averageVersion);
      }
      if (oracleDiff > 60 * 60 * 24 + 60 * 10) {
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
