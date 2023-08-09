import { toast } from 'react-toastify';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useChromaticClient } from '~/hooks/useChromaticClient';
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
  const { client } = useChromaticClient();

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
        // FIXME
        // Should use SDK instead actually.
        if (!client.walletClient) {
          return;
        }
        const { request } = await client
          .router()
          .contracts()
          .router()
          .simulate.createAccount({ account: client.walletClient?.account });
        const hash = await client.walletClient.writeContract(request);
        toast(
          'The account address is being generated on the chain. This process may take approximately 10 seconds or more.'
        );
        client.publicClient?.waitForTransactionReceipt({ hash });
      }}
      onDisconnect={disconnectAsync}
      onWalletCopy={copyText}
      onChromaticCopy={copyText}
    />
  );
};
