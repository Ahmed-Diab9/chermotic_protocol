import { toast } from 'react-toastify';
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
    accountAddress: chromaticAddress,
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
      onCreateAccount={async () => {
        await createAccount();
        toast(
          'The account address is being generated on the chain. This process may take approximately 10 seconds or more.'
        );
      }}
      onDisconnect={disconnectAsync}
      onWalletCopy={copyText}
      onChromaticCopy={copyText}
    />
  );
};
