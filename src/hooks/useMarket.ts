import { useEffect } from "react";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import { marketAction } from "../store/reducer/market";
import {
  OracleProvider__factory,
  USUMMarketFactory,
  USUMMarket__factory,
  getDeployedContract,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { isValid } from "../utils/valid";
import { useSelectedToken } from "./useSettlementToken";
import { Market } from "../typings/market";
import useLocalStorage from "./useLocalStorage";
import { ethers } from "ethers";

export const useMarket = (interval?: number) => {
  const [settlementToken] = useSelectedToken();
  const fetchKey = isValid(settlementToken?.address)
    ? ([settlementToken?.address] as const)
    : undefined;
  const {
    data: markets,
    error,
    mutate: fetchMarkets,
  } = useSWR(fetchKey, async ([tokenAddress]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const marketFactory = getDeployedContract(
      "USUMMarketFactory",
      "anvil",
      provider
    ) as USUMMarketFactory;
    const marketAddresses = await marketFactory.getMarketsBySettlmentToken(
      tokenAddress as string
    );

    const response = await Promise.allSettled(
      marketAddresses.map(async (marketAddress) => {
        const market = USUMMarket__factory.connect(marketAddress, provider);

        const oracleProviderAddress = await market.oracleProvider();
        const oracleProvider = OracleProvider__factory.connect(
          oracleProviderAddress,
          provider
        );
        const { price } = await oracleProvider.currentVersion();
        const description = await oracleProvider.description();
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
    if (!isValid(selectedMarket) && isValid(storedMarket)) {
      const nextMarket = markets?.find(
        (market) => market.address === storedMarket
      );
      if (!isValid(nextMarket)) {
        return;
      }
      dispatch(marketAction.onMarketSelect(nextMarket));
    }
  }, [markets, selectedMarket, storedMarket, dispatch]);

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
