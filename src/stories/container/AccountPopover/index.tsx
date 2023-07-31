import { useAccount, useConnect } from 'wagmi';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMargins } from '~/hooks/useMargins';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import useTokenTransaction from '~/hooks/useTokenTransaction';
import { AccountPopover as AccountPopoverPresenter } from '~/stories/molecule/AccountPopover';

export const AccountPopover = () => {
  const { address: walletAddress, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const {
    accountAddress: chromaticAccountAddress,
    createAccount,
    status,
    balances,
    isChromaticBalanceLoading,
    isAccountAddressLoading,
  } = useChromaticAccount();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { amount, onAmountChange, onDeposit, onWithdraw } = useTokenTransaction();
  const { totalBalance, totalAsset, totalMargin } = useMargins();
  const { currentToken, isTokenLoading } = useSettlementToken();
  const { isFeedLoading } = usePriceFeed();

  return (
    <AccountPopoverPresenter
      account={{ walletAddress, usumAddress: chromaticAccountAddress }}
      status={status}
      selectedToken={currentToken}
      walletBalances={tokenBalances}
      usumBalances={balances}
      amount={amount}
      totalBalance={totalBalance}
      availableMargin={totalMargin}
      assetValue={totalAsset}
      isLoading={isTokenLoading || isFeedLoading || isAccountAddressLoading}
      isBalanceLoading={isTokenBalanceLoading || isChromaticBalanceLoading}
      isConnected={isConnected}
      onAmountChange={onAmountChange}
      onDeposit={onDeposit}
      onWithdraw={onWithdraw}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
      onStatusUpdate={createAccount}
    />
  );
};
