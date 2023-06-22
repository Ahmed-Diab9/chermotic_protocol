import { useCallback } from "react";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";
import { Market } from "~/typings/market";
import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

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

export const useSelectedMarket = () => {
  const dispatch = useAppDispatch();

  const { markets, selectedMarket } = useMarket();

  const onMarketSelect = useCallback(
    (address: string) => {
      console.log("market selected");
      const nextMarket = markets?.find((market) => market.address === address);
      console.log("nextmarket", nextMarket);
      if (!isValid(nextMarket)) {
        errorLog("selected market is invalid.");
        return;
      }
      console.log("Market Selected", nextMarket.description);
      // dispatch(marketAction.onMarketSelect(nextMarket));
    },
    [markets]
  );

  return { selectedMarket, onMarketSelect };
};
