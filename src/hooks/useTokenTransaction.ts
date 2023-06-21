import { useCallback, useMemo, useState } from "react";
import { useUsumAccount } from "./useUsumAccount";
import { IERC20__factory } from "@chromatic-protocol/sdk/contracts";
import { useAccount, useSigner } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { useSelectedToken } from "./useSettlementToken";
import { bigNumberify, expandDecimals } from "../utils/number";
import { useAppSelector } from "../store";

const useTokenTransaction = () => {
  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();
  const { account: usumAccount } = useUsumAccount();
  const token = useAppSelector((state) => state.market.selectedToken);
  const [amount, setAmount] = useState("");
  const tokenContract = useMemo(() => {
    if (isValid(token) && isValid(signer)) {
      return IERC20__factory.connect(token.address, signer);
    }
  }, [token, signer]);

  const onDeposit = useCallback(async () => {
    if (!isValid(walletAddress) || !isValid(usumAccount)) {
      errorLog("no addresses selected");
      return;
    }
    if (!isValid(token)) {
      errorLog("token are not selected");
      return;
    }
    const expanded = bigNumberify(amount)?.mul(expandDecimals(token.decimals));
    if (!isValid(expanded)) {
      errorLog("invalid amount");
      return;
    }
    tokenContract?.transfer(usumAccount.address, expanded);
  }, []);

  const onWithdraw = useCallback(async () => {
    if (!isValid(usumAccount)) {
      errorLog("contract is not ready");
      return;
    }
    if (!isValid(token)) {
      errorLog("token are not selected");
      return;
    }
    const expanded = bigNumberify(amount)?.mul(expandDecimals(token.decimals));
    if (!isValid(expanded)) {
      errorLog("invalid amount");
      return;
    }
    await usumAccount.withdraw(token.address, expanded);
  }, [usumAccount, token, amount]);

  const onAmountChange = useCallback((nextValue: string) => {
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(nextValue);
  }, []);
  return [amount, onAmountChange, onDeposit, onWithdraw] as const;
};

export default useTokenTransaction;
