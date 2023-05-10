import { useSigner } from "wagmi";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import { USUMMarketFactory__factory, deployedAddress } from "@quarkonix/usum";
import { errorLog, infoLog } from "../utils/log";
import { useEffect, useMemo } from "react";
import { marketAction } from "../store/reducer/market";
import { isValid } from "../utils/valid";
import useLocalStorage from "./useLocalStorage";

export const useSettlementToken = () => {
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const factory = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }
    return USUMMarketFactory__factory.connect(
      deployedAddress["anvil"]["USUMMarketFactory"],
      signer
    );
  }, [signer]);
  const fetchKey = isValid(factory) ? [factory] : undefined;

  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(fetchKey, async ([factory]) => {
    const response = await factory.registeredSettlementTokens();
    return response.map((address) => ({ address }));
  });

  useEffect(() => {
    dispatch(marketAction.onTokensUpdate(tokens ?? []));
  }, [dispatch, tokens]);

  if (error) {
    errorLog(error);
  }

  return [tokens, fetchTokens] as const;
};

export const useSelectedToken = () => {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.market.tokens);
  const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const [storedToken, setStoredToken] = useLocalStorage<string>("usum:token");

  useEffect(() => {
    infoLog("run effect in useSettlementToken.ts");
    if (!isValid(selectedToken) && isValid(storedToken)) {
      const nextToken = tokens.find((token) => token.address === storedToken);
      if (!isValid(nextToken)) {
        return;
      }
      dispatch(marketAction.onTokenSelect(nextToken));
    }
  }, [tokens, selectedToken, storedToken, dispatch]);

  const onTokenSelect = (address: string) => {
    const nextToken = tokens.find((token) => token.address === address);
    if (!isValid(nextToken)) {
      errorLog("selected token is invalid.");
      return;
    }
    setStoredToken(nextToken.address);
    dispatch(marketAction.onTokenSelect(nextToken));
  };

  return [selectedToken, onTokenSelect] as const;
};
