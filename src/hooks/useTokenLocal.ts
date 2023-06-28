import { useCallback, useEffect } from "react";
import { useAppDispatch } from "~/store";
import { tokenAction } from "~/store/reducer/token";
import { isValid } from "~/utils/valid";
import useLocalStorage from "./useLocalStorage";
import { useSettlementToken } from "./useSettlementToken";

export const useTokenLocal = () => {
  const { tokens } = useSettlementToken();
  const dispatch = useAppDispatch();
  const { state: storedToken } = useLocalStorage("usum:token");

  const onMount = useCallback(() => {
    let token = tokens?.find((token) => token.name === storedToken);
    if (isValid(token)) {
      dispatch(tokenAction.onTokenSelect(token));
      return;
    }
    token = tokens?.[0];
    if (isValid(token)) {
      dispatch(tokenAction.onTokenSelect(token));
      return;
    }
  }, [tokens, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
