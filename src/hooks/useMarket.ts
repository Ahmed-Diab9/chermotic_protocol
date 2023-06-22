import { useCallback } from "react";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";
import { Market } from "~/typings/market";
import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import useLocalStorage from "./useLocalStorage";

export const useMarket = (_interval?: number) => {
  const { client } = useChromaticClient();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(
    isValid(selectedToken) ? ["MARKET", selectedToken.address] : undefined,
    async ([_, tokenAddress]) => {
      const markets = await client?.marketFactory().getMarkets(tokenAddress);

      return markets;
    }
  );

  if (error) {
    errorLog(error);
  }

  return { markets, fetchMarkets } as const;
};

export const useMarketSelect = () => {
  const dispatch = useAppDispatch();
  const { setState: setStoredMarket } = useLocalStorage("usum:market");

  const onMarketSelect = useCallback(
    (market: Market) => {
      console.log("market selected");

      dispatch(marketAction.onMarketSelect(market));
      setStoredMarket(market.description);
    },
    [dispatch]
  );

  return onMarketSelect;
};
