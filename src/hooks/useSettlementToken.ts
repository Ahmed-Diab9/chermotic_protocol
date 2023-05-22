import { useEffect, useMemo } from "react";
import { useProvider } from "wagmi";
import useSWR from "swr";

import { IERC20Metadata__factory } from "@quarkonix/usum";

import { Token } from "~/typings/market";

import { useAppDispatch, useAppSelector } from "~/store";
import { marketAction } from "~/store/reducer/market";

import useLocalStorage from "~/hooks/useLocalStorage";
import { useMarketFactory } from "~/hooks/useMarketFactory";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useSettlementToken = () => {
  const provider = useProvider();
  const [marketFactory] = useMarketFactory();

  const fetchKey = useMemo(
    () => (isValid(marketFactory) ? ([marketFactory] as const) : undefined),
    [marketFactory]
  );

  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(fetchKey, async ([marketFactory]) => {
    const addresses = await marketFactory.registeredSettlementTokens();
    const promise = addresses.map(async (address) => {
      const { symbol, decimals } = IERC20Metadata__factory.connect(
        address,
        provider
      );

      return {
        name: await symbol(),
        address,
        decimals: await decimals(),
      } satisfies Token;
    });

    const response = await Promise.allSettled(promise);
    const fulfilled = response
      .filter(
        (result): result is PromiseFulfilledResult<Token> =>
          result.status === "fulfilled"
      )
      .map(({ value }) => value);

    return fulfilled;
  });

  if (error) {
    errorLog(error);
  }

  return [tokens, fetchTokens] as const;
};

export const useSelectedToken = () => {
  const dispatch = useAppDispatch();

  const [tokens] = useSettlementToken();

  const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const [storedToken, setStoredToken] = useLocalStorage<string>("usum:token");

  useEffect(() => {
    if (isValid(selectedToken) || !isValid(tokens)) return;
    else if (isValid(storedToken)) onTokenSelect(storedToken);
    else onTokenSelect(tokens[0].address);
  }, [tokens]);

  const onTokenSelect = (address: string) => {
    const nextToken = tokens?.find((token) => token.address === address);
    if (!isValid(nextToken)) {
      errorLog("selected token is invalid.");
      return;
    }
    setStoredToken(nextToken.address);
    dispatch(marketAction.onTokenSelect(nextToken));
  };

  return [selectedToken, onTokenSelect] as const;
};
