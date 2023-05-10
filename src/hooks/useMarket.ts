import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import { marketAction } from "../store/reducer/market";
import {
  OracleProvider__factory,
  USUMMarketFactory__factory,
  USUMMarket__factory,
  deployedAddress,
} from "@quarkonix/usum";
import { useSigner } from "wagmi";
import { errorLog, infoLog } from "../utils/log";
import { isValid } from "../utils/valid";
import { useSelectedToken } from "./useSettlementToken";
import { Market } from "../typings/market";
import useLocalStorage from "./useLocalStorage";

export const useMarket = (interval?: number) => {
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const [settlementToken] = useSelectedToken();
  const marketFactory = useMemo(() => {
    if (isValid(signer)) {
      return USUMMarketFactory__factory.connect(
        deployedAddress["anvil"]["USUMMarketFactory"],
        signer
      );
    }
  }, [signer]);

  const fetchKey =
    isValid(settlementToken?.address) &&
    isValid(marketFactory) &&
    isValid(signer)
      ? ([settlementToken?.address, marketFactory, signer] as const)
      : undefined;
  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(fetchKey, async ([tokenAddress, marketFactory, signer]) => {
    const marketAddresses = await marketFactory.getMarketsBySettlmentToken(
      tokenAddress as string
    );

    const response = await Promise.allSettled(
      marketAddresses.map(async (marketAddress) => {
        const market = USUMMarket__factory.connect(marketAddress, signer);

        const oracleProviderAddress = await market.oracleProvider();
        const provider = OracleProvider__factory.connect(
          oracleProviderAddress,
          signer
        );
        const { price } = await provider.currentVersion();
        const description = await provider.description();
        return { address: marketAddress, description, price } satisfies Market;
      })
    );

    return response
      .filter(
        (value): value is PromiseFulfilledResult<Market> =>
          value.status === "fulfilled"
      )
      .map((result) => result.value);
  });

  useEffect(() => {
    dispatch(marketAction.onMarketsUpdate(markets ?? []));
  }, [dispatch, markets]);

  if (error) {
    errorLog(error);
  }

  return [markets, fetchMarkets] as const;
};

export const useSelectedMarket = () => {
  const dispatch = useAppDispatch();
  const markets = useAppSelector((state) => state.market.markets);
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);

  const [storedMarket, setStoredMarket] =
    useLocalStorage<string>("usum:market");

  useEffect(() => {
    infoLog("run effect in useMarket.ts");
    if (!isValid(selectedMarket) && isValid(storedMarket)) {
      const nextMarket = markets.find(
        (market) => market.address === storedMarket
      );
      if (!isValid(nextMarket)) {
        return;
      }
      dispatch(marketAction.onMarketSelect(nextMarket));
    }
  }, [markets, selectedMarket, storedMarket, dispatch]);

  const onMarketSelect = (address: string) => {
    const nextMarket = markets.find((market) => market.address === address);
    if (!isValid(nextMarket)) {
      errorLog("selected market is invalid.");
      return;
    }
    setStoredMarket(nextMarket.address);
    dispatch(marketAction.onMarketSelect(nextMarket));
  };

  return [selectedMarket, onMarketSelect] as const;
};
