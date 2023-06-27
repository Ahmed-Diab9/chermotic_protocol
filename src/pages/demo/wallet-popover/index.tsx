import { useAccount, useDisconnect } from "wagmi";
import { WalletPopover } from "../../../stories/molecule/WalletPopover";
import { useUsumAccount } from "../../../hooks/useUsumAccount";
import { copyText } from "../../../utils/clipboard";
import usePriceFeed from "../../../hooks/usePriceFeed";
import useConnectOnce from "../../../hooks/useConnectOnce";
import { useLiquidityPoolSummary } from "../../../hooks/useLiquidityPool";
import { useSettlementToken } from "../../../hooks/useSettlementToken";
import { useUsumBalances, useWalletBalances } from "../../../hooks/useBalances";
import { useMarket } from "../../../hooks/useMarket";
import useOracleVersion from "../../../hooks/useOracleVersion";

const WalletPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const { account } = useUsumAccount();
  const { walletBalances } = useWalletBalances();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const { priceFeed } = usePriceFeed();
  useOracleVersion();

  return (
    <>
      <WalletPopover
        account={{ walletAddress, usumAddress: account?.address }}
        tokens={tokens}
        markets={markets}
        balances={walletBalances}
        pools={pools}
        priceFeed={priceFeed}
        onUsumCopy={copyText}
        onWalletCopy={copyText}
        onDisconnect={() => {
          disconnectAsync?.();
        }}
      />
    </>
  );
};

export default WalletPopoverDemo;
