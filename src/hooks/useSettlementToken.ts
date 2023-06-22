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
