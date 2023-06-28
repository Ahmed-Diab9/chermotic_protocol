import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { useTokenBalances } from '../../../hooks/useBalances';
import useConnectOnce from '../../../hooks/useConnectOnce';
import {
  useSettlementToken,
} from '../../../hooks/useSettlementToken';
import useTokenTransaction from '../../../hooks/useTokenTransaction';
import { useUsumAccount } from '../../../hooks/useUsumAccount';
import { AssetPopover } from '../../../stories/molecule/AssetPopover';
import { bigNumberify, expandDecimals } from '../../../utils/number';
import { isValid } from '../../../utils/valid';

const AssetPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const { accountAddress: usumAccount ,balances} = useUsumAccount();
  const { tokens, onTokenSelect } = useSettlementToken();
  // const { usumBalances } = useUsumBalances();
  const { useTokenBalances: walletBalances } = useTokenBalances();
  // const onTokenSelect = useTokenSelect();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const { amount, onAmountChange, onDeposit, onWithdraw } = useTokenTransaction();

  const isAllowed = useMemo(() => {
    if (!isValid(balances) || !isValid(selectedToken)) {
      return false;
    }
    const expandedAmount = bigNumberify(amount)?.mul(expandDecimals(selectedToken.decimals));
    if (!isValid(expandedAmount)) {
      return false;
    }
    return balances[selectedToken.name].gt(expandedAmount);
  }, [balances, selectedToken, amount]);

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
        usumBalances={balances}
        amount={amount}
        onAmountChange={onAmountChange}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />
      <select
        value={selectedToken?.name}
        onChange={(event) => {
          const index = Number(event.target.value);
          const nextToken = tokens?.find((_, tokenIndex) => tokenIndex === index);
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
