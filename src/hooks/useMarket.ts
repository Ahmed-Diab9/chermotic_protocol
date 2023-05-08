import { useEffect } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import { marketAction } from "../store/reducer/market";
import useOracleProvider from "./useOracleProvider";
import { OracleProvider__factory } from "@quarkonix/usum";
import { useSigner } from "wagmi";
import { Market } from "../typings/market";
import { errorLog } from "../utils/log";
import { isValid } from "../utils/valid";

export const useMarket = (interval?: number) => {
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const [oracleProviders] = useOracleProvider();
  const fetchKey =
    isValid(oracleProviders) && isValid(signer)
      ? ([oracleProviders, signer] as const)
      : undefined;

  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(fetchKey, async ([oracleProviders, signer]) => {
    const response = await Promise.allSettled(
      oracleProviders.map(async (providerAddress) => {
        const factory = OracleProvider__factory.connect(
          providerAddress,
          signer
  );
        const description = await factory.description();
        return { address: providerAddress, description } satisfies Market;
      })
  );
    return response
      .filter(
        (element): element is PromiseFulfilledResult<Market> =>
          element.status === "fulfilled"
      )
      .map((element) => element.value);
  });

  useEffect(() => {
    dispatch(marketAction.onMarketsUpdate(markets ?? []));
  }, [dispatch, markets]);

  if (error) {
    errorLog(error);
  }
  return [markets, fetchMarkets] as const;
};
};

export default useMarket;
