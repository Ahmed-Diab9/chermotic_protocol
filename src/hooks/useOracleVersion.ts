import {
  IOracleProvider__factory,
  ChromaticMarket__factory,
} from "@chromatic-protocol/sdk";
import { useMarket } from "./useMarket";
import { isValid } from "../utils/valid";
import { useProvider } from "wagmi";
import { useMemo } from "react";
import useSWR from "swr";
import { filterIfFulfilled } from "~/utils/array";
import { errorLog } from "~/utils/log";
import { OracleVersion } from "~/typings/oracleVersion";

const useOracleVersion = () => {
  const [markets] = useMarket();
  const provider = useProvider();
  const fetchKey = useMemo(() => {
    if (isValid(markets) && isValid(provider)) {
      return [markets, provider] as const;
    }
  }, [markets, provider]);

  const {
    data: oracleVersions,
    error,
    mutate: fetchOracleVersions,
  } = useSWR(
    fetchKey,
    async ([markets, provider]) => {
      const promise = markets.map(async (market) => {
        const marketContract = ChromaticMarket__factory.connect(
          market.address,
          provider
        );
        const oracleProviderAddress = await marketContract.oracleProvider();
        const oracleProvider = IOracleProvider__factory.connect(
          oracleProviderAddress,
          provider
        );
        const { price, version, timestamp } =
          await oracleProvider.currentVersion();
        return {
          address: market.address,
          price,
          version,
          timestamp,
          decimals: 18,
        };
      });
      const response = await filterIfFulfilled(promise);

      return response.reduce((record, { address, ...oracle }) => {
        record[address] = oracle;
        return record;
      }, {} as Record<string, OracleVersion & { decimals: number }>);
    },
    {
      refreshInterval: 10000,
    }
  );

  if (error) {
    errorLog(error);
  }

  return { oracleVersions, fetchOracleVersions };
};

export default useOracleVersion;
