import { useAccount } from "wagmi";
import { useUsumAccount } from "../../../hooks/useUsumAccount";
import { AssetPopover } from "../../../stories/molecule/AssetPopover";
import {
  useSettlementToken,
  useTokenSelect,
} from "../../../hooks/useSettlementToken";
import useTokenTransaction from "../../../hooks/useTokenTransaction";
import { useEffect, useMemo } from "react";
import { bigNumberify, expandDecimals } from "../../../utils/number";
import { isValid } from "../../../utils/valid";
import useConnectOnce from "../../../hooks/useConnectOnce";
import { useUsumBalances, useWalletBalances } from "../../../hooks/useBalances";
import { useAppSelector } from "~/store";

const AssetPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const { account: usumAccount } = useUsumAccount();
  const { tokens } = useSettlementToken();
  const { usumBalances } = useUsumBalances();
  const { walletBalances } = useWalletBalances();
  const onTokenSelect = useTokenSelect();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const { amount, onAmountChange, onDeposit, onWithdraw } =
    useTokenTransaction();

  const isAllowed = useMemo(() => {
    if (!isValid(usumBalances) || !isValid(selectedToken)) {
      return false;
    }
    const expandedAmount = bigNumberify(amount)?.mul(
      expandDecimals(selectedToken.decimals)
    );
    if (!isValid(expandedAmount)) {
      return false;
    }
    return usumBalances[selectedToken.name].gt(expandedAmount);
  }, [usumBalances, selectedToken, amount]);

  useEffect(() => {
    if (isValid(tokens) && isValid(tokens[0])) {
      onTokenSelect(tokens[0]);
    }
  }, [tokens, onTokenSelect]);

  return (
    <>
      <AssetPopover
        account={{ walletAddress, usumAddress: usumAccount?.address }}
        token={selectedToken}
        walletBalances={walletBalances}
        usumBalances={usumBalances}
        amount={amount}
        onAmountChange={onAmountChange}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />
      <select
        value={selectedToken?.name}
        onChange={(event) => {
          const index = Number(event.target.value);
          const nextToken = tokens?.find(
            (_, tokenIndex) => tokenIndex === index
          );
          if (isValid(nextToken)) {
            onTokenSelect(nextToken);
          }
        }}
      >
        {tokens?.map((token, tokenIndex) => {
          return (
            <option key={token.address} value={tokenIndex}>
              {token.name}
            </option>
          );
        })}
      </select>
    </>
  );
};

export default AssetPopoverDemo;
