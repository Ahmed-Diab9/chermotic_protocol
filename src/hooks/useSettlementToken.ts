import { useSigner } from "wagmi";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import {
  IERC20Metadata__factory,
  USUMMarketFactory,
  getDeployedContract,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { useEffect, useMemo } from "react";
import { marketAction } from "../store/reducer/market";
import { isValid } from "../utils/valid";
import useLocalStorage from "./useLocalStorage";
import { Token } from "../typings/market";

export const useSettlementToken = () => {
  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
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

  const fetchKey =
    isValid(factory) && isValid(signer)
      ? ([factory, signer] as const)
      : undefined;
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(fetchKey, async ([factory, signer]) => {
    const addresses = await factory.registeredSettlementTokens();
    const promise = addresses.map(async (address) => {
      const tokenContract = IERC20Metadata__factory.connect(address, signer);

      return {
        name: await tokenContract.symbol(),
        address,
        decimals: await tokenContract.decimals(),
      } satisfies Token;
    });
    const response = await Promise.allSettled(promise);
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
