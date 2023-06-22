import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";
import { useAppDispatch } from "~/store";
import { errorLog } from "~/utils/log";
import { Token } from "~/typings/market";
import { tokenAction } from "~/store/reducer/token";
import { useAccount } from "wagmi";

export const useSettlementToken = () => {
  const { client } = useChromaticClient();
  const { address } = useAccount();
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
  } = useSWR(["SETTLEMENT_TOKENS", address], async () => {
    if (!marketFactoryApi) {
      return;
    }
    const tokens = await marketFactoryApi.registeredSettlementTokens();
    return tokens;
  });

  if (error) {
    errorLog(error);
  }

  return { tokens, fetchTokens };
};

export const useTokenSelect = () => {
  const dispatch = useAppDispatch();

  const onTokenSelect = useCallback(
    (token: Token) => {
      dispatch(tokenAction.onTokenSelect(token));
    },
    [dispatch]
  );

  return onTokenSelect;
};
