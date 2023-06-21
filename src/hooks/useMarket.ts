import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useProvider } from "wagmi";

// import {
//   ChromaticMarket__factory,
//   IOracleProvider__factory,
// } from "@chromatic-protocol/sdk/contracts";
import { useChromaticClient } from "./useChromaticClient";
import { Market } from "~/typings/market";

import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";

import useLocalStorage from "~/hooks/useLocalStorage";
import { useMarketFactory } from "~/hooks/useMarketFactory";
import { useSelectedToken } from "~/hooks/useSettlementToken";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import {
  ChromaticMarket__factory,
  IOracleProvider__factory,
} from "@chromatic-protocol/sdk/contracts";

export const useMarket = (_interval?: number) => {
  const { client } = useChromaticClient();
  const selectedToken = useAppSelector((state) => state.market.selectedToken);
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(
    `market#${selectedToken?.address}`,
    async () => {
      if (selectedToken === undefined) {
        console.log("use market selected token", selectedToken);
        return;
      }
      const markets = await client
        ?.marketFactory()
        .getMarkets(selectedToken?.address);

      console.log("Markets", markets);
      return markets;
    },
    {
      dedupingInterval: _interval || 1000,
    }
  );

  if (error) {
    errorLog(error);
  }

  return { markets, fetchMarkets, selectedMarket } as const;
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
