import { useCallback, useEffect, useMemo, useState } from "react";
import { useProvider, useSigner, useAccount } from "wagmi";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";

import { IERC20Metadata__factory } from "@chromatic-protocol/sdk/contracts";

import { Token } from "~/typings/market";

import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";

import useLocalStorage from "~/hooks/useLocalStorage";
import { useMarketFactory } from "~/hooks/useMarketFactory";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useSettlementToken = () => {
  const provider = useProvider();
  const {client} = useChromaticClient()
  const marketFactoryApi = client?.marketFactory()
  const fetchKey = `settlementTokens`
  const {address} = useAccount()
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR([fetchKey, address], async ()=> {
    if(!marketFactoryApi) return []
    const tokens = await marketFactoryApi.registeredSettlementTokens();
    console.log('settlement ', tokens)
    return tokens
  }, {
    dedupingInterval: 5 * 60 * 1000
  });

  if (error) {
    errorLog(error);
  }

  return [tokens, fetchTokens] as const;
};

export const useSelectedToken = () => {
  const dispatch = useAppDispatch();

  const [tokens] = useSettlementToken();

  // const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const { state: storedToken, setState: setStoredToken, deleteState: deleteToken } =
    useLocalStorage<string>("usum:token");

  const onTokenSelect = useCallback(
    (address: string) => {
      const nextToken = tokens?.find((token) => token.address === address);
      if (!isValid(nextToken)) {
        errorLog("Settlement Token:selected token is invalid.");
        deleteToken()
        return;
      }
      setStoredToken(nextToken.address);
      dispatch(marketAction.onTokenSelect(nextToken));
    },
    [tokens, setStoredToken, dispatch]
  );

  useEffect(() => {
    if (!isValid(tokens)) return;
    else if (isValid(storedToken)) onTokenSelect(storedToken);
    else {
      if (tokens[0]?.address) {
        onTokenSelect(tokens[0].address);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedToken, tokens, onTokenSelect]);

  return [undefined, onTokenSelect] as const;
};
