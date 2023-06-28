import { useAccount, useDisconnect } from "wagmi";
import { useTokenBalances } from "../../../hooks/useBalances";
import useConnectOnce from "../../../hooks/useConnectOnce";
import { useLiquidityPoolSummary } from "../../../hooks/useLiquidityPool";
import { useMarket } from "../../../hooks/useMarket";
import useOracleVersion from "../../../hooks/useOracleVersion";
import usePriceFeed from "../../../hooks/usePriceFeed";
import { useSettlementToken } from "../../../hooks/useSettlementToken";
import { useUsumAccount } from "../../../hooks/useUsumAccount";
import { WalletPopover } from "../../../stories/molecule/WalletPopover";
import { copyText } from "../../../utils/clipboard";

const WalletPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const { accountAddress : account } = useUsumAccount();
  const { useTokenBalances: walletBalances } = useTokenBalances();
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
