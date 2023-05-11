import { useSigner } from "wagmi";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import {
  Account__factory,
  USUMMarketFactory,
  getDeployedContract,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { useEffect, useMemo } from "react";
import { marketAction } from "../store/reducer/market";
import { isValid } from "../utils/valid";
import { USDC } from "../configs/token";
import useLocalStorage from "./useLocalStorage";
import useUsumAccount from "./useUsumAccount";
import { Token } from "../typings/market";

export const useSettlementToken = () => {
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const [usumAccount] = useUsumAccount();
  const factory = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }
    return getDeployedContract(
      "USUMMarketFactory",
      "anvil",
      signer
    ) as USUMMarketFactory;
  }, [signer]);
  const account = useMemo(() => {
    if (!isValid(usumAccount) || !isValid(signer)) {
      return;
    }
    return Account__factory.connect(usumAccount, signer);
  }, [usumAccount, signer]);

  const fetchKey =
    isValid(factory) && isValid(account)
      ? ([factory, account] as const)
      : undefined;
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(fetchKey, async ([factory, account]) => {
    const addresses = await factory.registeredSettlementTokens();
    const response = await Promise.allSettled(
      addresses.map(async (address) => {
        const balance = await account.balance(address);
        const name = address === USDC ? "USDC" : "URT";
        return { name, address, balance } satisfies Token;
      })
    );
    const nextTokens = response
      .filter(
        (result): result is PromiseFulfilledResult<Token> =>
          result.status === "fulfilled"
      )
      .map(({ value }) => value);
    return nextTokens;
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
