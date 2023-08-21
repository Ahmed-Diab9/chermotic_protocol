import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';
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
  const { accountAddress: chromaticAddress, isChromaticBalanceLoading } = useChromaticAccount();
  const { onCreateAccountWithToast } = useCreateAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { priceFeed } = usePriceFeed();
  const { ownedPoolSummary } = useOwnedLiquidityPools();
  const { disconnectAsync } = useDisconnect();

  return (
    <WalletPopoverPresenter
      account={{ walletAddress, chromaticAddress }}
      tokens={tokens}
      markets={markets}
      balances={tokenBalances}
      priceFeed={priceFeed}
      pools={ownedPoolSummary}
      isLoading={isTokenBalanceLoading || isChromaticBalanceLoading}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
      onCreateAccount={onCreateAccountWithToast}
      onDisconnect={disconnectAsync}
      onWalletCopy={copyText}
      onChromaticCopy={copyText}
    />
  );
};
