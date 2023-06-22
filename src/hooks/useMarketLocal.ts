import { isValid } from "~/utils/valid";
import useLocalStorage from "./useLocalStorage";
import { useAppDispatch } from "~/store";
import { useCallback, useEffect } from "react";
import { traceLog } from "~/utils/log";
import { useMarket } from "./useMarket";
import { marketAction } from "~/store/reducer/market";

export const useMarketLocal = () => {
  const { markets } = useMarket();
  const dispatch = useAppDispatch();
  const { state: storedMarket } = useLocalStorage("usum:market");

  const onMount = useCallback(() => {
    let market = markets?.find((market) => market.description === storedMarket);
    traceLog("tokens", markets);
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
    market = markets?.[0];
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
  }, [markets, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
