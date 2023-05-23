import { useAccount, useDisconnect } from "wagmi";
import { WalletPopover } from "../../../stories/molecule/WalletPopover";
import useUsumAccount from "../../../hooks/useUsumAccount";
import { copyText } from "../../../utils/clipboard";
import usePriceFeed from "../../../hooks/usePriceFeed";
import useConnectOnce from "../../../hooks/useConnectOnce";
import { useLpToken } from "../../../hooks/useLpToken";
import { useSettlementToken } from "../../../hooks/useSettlementToken";
import useBalances from "../../../hooks/useBalances";
import { useMarket } from "../../../hooks/useMarket";
import useOracleVersion from "../../../hooks/useOracleVersion";

const WalletPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const [tokens] = useSettlementToken();
  const [markets] = useMarket();
  const [usumAddress, fetchAddress, createAddress] = useUsumAccount();
  const { walletBalances } = useBalances();
  const [lpTokens] = useLpToken();
  const { disconnectAsync } = useDisconnect();
  const [feed] = usePriceFeed();
  useOracleVersion();

  return (
    <>
      <WalletPopover
        account={{ walletAddress, usumAddress }}
        tokens={tokens}
        markets={markets}
        balances={walletBalances}
        lpTokens={lpTokens}
        priceFeed={feed}
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
