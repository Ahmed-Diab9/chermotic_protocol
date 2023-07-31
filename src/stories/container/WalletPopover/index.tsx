import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMarket } from '~/hooks/useMarket';
import { useOwnedLiquidityPools } from '~/hooks/useOwnedLiquidityPools';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { WalletPopover as WalletPopoverPresenter } from '~/stories/molecule/WalletPopover';
import { copyText } from '~/utils/clipboard';

export const WalletPopover = () => {
  const { connectAsync, connectors } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    accountAddress: chromaticAccountAddress,
    createAccount,
    isChromaticBalanceLoading,
  } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { priceFeed } = usePriceFeed();
  const { ownedPoolSummary } = useOwnedLiquidityPools();
  const { disconnectAsync } = useDisconnect();

  return (
    <WalletPopoverPresenter
      account={{ walletAddress, usumAddress: chromaticAccountAddress }}
      tokens={tokens}
      markets={markets}
      balances={tokenBalances}
      priceFeed={priceFeed}
      pools={ownedPoolSummary}
      isLoading={isTokenBalanceLoading || isChromaticBalanceLoading}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
      onCreateAccount={createAccount}
      onDisconnect={disconnectAsync}
      onWalletCopy={copyText}
      onUsumCopy={copyText}
    />
  );
};
