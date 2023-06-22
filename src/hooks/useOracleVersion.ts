import {
  IOracleProvider__factory,
  ChromaticMarket__factory,
} from "@chromatic-protocol/sdk/contracts";
import { useMarket } from "./useMarket";
import { isValid } from "../utils/valid";
import { useProvider, useAccount } from "wagmi";
import { useMemo } from "react";
import useSWR from "swr";
import { filterIfFulfilled } from "~/utils/array";
import { errorLog } from "~/utils/log";
import { OracleVersion } from "~/typings/oracleVersion";

const useOracleVersion = () => {
  const { markets } = useMarket();
  const provider = useProvider();
  const { address } = useAccount()
  const marketAddresses = (markets ?? []).map((market) => market.address);

  const {
    data: oracleVersions,
    error,
    mutate: fetchOracleVersions,
  } = useSWR(
    ["ORACLE_VERSION", address, ...marketAddresses],
    async () => {
      const promise = (marketAddresses ?? []).map(async (marketAddress) => {
        const marketContract = ChromaticMarket__factory.connect(
          marketAddress,
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
          address: marketAddress,
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
      refreshInterval: 1000 * 60,
    }
  );

  if (error) {
    errorLog(error);
  }

  return { oracleVersions, fetchOracleVersions };
};

export default useOracleVersion;
