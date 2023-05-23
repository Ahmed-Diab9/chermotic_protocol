import { useMemo, useState } from "react";
import { useUsumAccount } from "./useUsumAccount";
import { Account__factory, IERC20__factory } from "@quarkonix/usum";
import { useAccount, useSigner } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { useSelectedToken } from "./useSettlementToken";
import { bigNumberify, expandDecimals } from "../utils/number";

const useTokenTransaction = () => {
  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();
  const [usumAccount] = useUsumAccount();
  const [token] = useSelectedToken();
  const [amount, setAmount] = useState("");
  const tokenContract = useMemo(() => {
    if (isValid(token) && isValid(signer)) {
      return IERC20__factory.connect(token.address, signer);
    }
  }, [token, signer]);

  const onDeposit = async () => {
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
  };

  const onWithdraw = async () => {
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
  };

  const onAmountChange = (nextValue: string) => {
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(nextValue);
  };
  return [amount, onAmountChange, onDeposit, onWithdraw] as const;
};

export default useTokenTransaction;
