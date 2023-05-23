import { useEffect, useMemo } from "react";
import { useProvider } from "wagmi";
import useSWR from "swr";

import { OracleProvider__factory, USUMMarket__factory } from "@quarkonix/usum";

import { Market } from "~/typings/market";

import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";

import useLocalStorage from "~/hooks/useLocalStorage";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useMarketFactory } from "~/hooks/useMarketFactory";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useMarket = (_interval?: number) => {
  const provider = useProvider();

  const [selectedToken] = useSelectedToken();
  const [marketFactory] = useMarketFactory();

  const fetchKey = useMemo(() => {
    return isValid(selectedToken) ? ([selectedToken] as const) : undefined;
  }, [selectedToken]);

  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(fetchKey, async ([selectedToken]) => {
    const response = await Promise.allSettled(
      (
        await marketFactory.getMarketsBySettlmentToken(
          selectedToken.address as string
        )
      ).map(async (marketAddress) => {
        const market = USUMMarket__factory.connect(marketAddress, provider);

        const oracleProviderAddress = await market.oracleProvider();
        const oracleProvider = OracleProvider__factory.connect(
          oracleProviderAddress,
          provider
        );
        async function getPrice() {
          const { price } = await oracleProvider.currentVersion();
          return price;
        }
        const description = await oracleProvider.description();
        return {
          address: marketAddress,
          description,
          getPrice,
        } satisfies Market;
      })
    );

    const fulfilled = response
      .filter(
        (value): value is PromiseFulfilledResult<Market> =>
          value.status === "fulfilled"
      )
      .map((result) => result.value);

    return fulfilled;
  });

  if (error) {
    errorLog(error);
  }

  return [markets, fetchMarkets] as const;
};

export const useSelectedMarket = () => {
  const dispatch = useAppDispatch();

  const [markets] = useMarket();

  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);

  const [storedMarket, setStoredMarket] =
    useLocalStorage<string>("usum:market");

  useEffect(() => {
    if (isValid(selectedMarket) || !isValid(markets)) return;
    else if (isValid(storedMarket)) onMarketSelect(storedMarket);
    else onMarketSelect(markets[0].address);
  }, [markets]);

  const onMarketSelect = (address: string) => {
    const nextMarket = markets?.find((market) => market.address === address);
    if (!isValid(nextMarket)) {
      errorLog("selected market is invalid.");
      return;
    }
    setStoredMarket(nextMarket.address);
    dispatch(marketAction.onMarketSelect(nextMarket));
  };

  return [selectedMarket, onMarketSelect] as const;
};
