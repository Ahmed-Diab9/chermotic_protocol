import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";



import { useAppDispatch } from "~/store";
import { marketAction } from "~/store/reducer/market";


import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useSettlementToken = () => {
  const { client } = useChromaticClient();
  const marketFactoryApi = useMemo(()=>client?.marketFactory(), [client])
  // const fetchKey = `settlementTokens`;
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(
    ['settlementTokens', marketFactoryApi],
    async () => {
      console.log("Client?", client === undefined)
      if (!marketFactoryApi) {
        console.log("marketFactoryApi not exists");
        throw new Error("marketFactoryApi not exists");
      }
      const tokens = await marketFactoryApi.registeredSettlementTokens();
      console.log("Tokens", tokens);
      return tokens;
    } 
  );

  if (error) {
    errorLog(error);
  }

  return { tokens, fetchTokens };
};

export const useSelectedToken = () => {
  const dispatch = useAppDispatch();

  const { tokens } = useSettlementToken();

  // const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const onTokenSelect = useCallback(
    (address: string) => {
      const nextToken = tokens?.find((token) => token.address === address);
      if (!isValid(nextToken)) {
        errorLog("Settlement Token:selected token is invalid.");
        // deleteToken();
        return;
      }
      // setStoredToken(nextToken.address);
      dispatch(marketAction.onTokenSelect(nextToken));
    },
    [tokens, dispatch]
  );

  return [undefined, onTokenSelect] as const;
};
