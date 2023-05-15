import { useAccount } from "wagmi";
import { WalletPopover } from "../../../stories/molecule/WalletPopover";
import useUsumAccount from "../../../hooks/useUsumAccount";
import { useEffect } from "react";
import useConnectOnce from "../../../hooks/useConnectOnce";
import { copyText } from "../../../utils/clipboard";
import { tokensMock } from "../../../mock";
import usePriceFeed from "../../../hooks/usePriceFeed";

const WalletPopoverDemo = () => {
  const { address: walletAddress } = useAccount();
  const [usumAddress, fetchAddress, createAddress] = useUsumAccount();
  const connectOnce = useConnectOnce();
  const tokens = tokensMock;
  const [feed] = usePriceFeed();

  useEffect(() => {
    connectOnce();
  }, [connectOnce]);

  return (
    <>
      <WalletPopover
        account={{ walletAddress, usumAddress }}
        tokens={tokens ?? []}
        priceFeed={feed}
        onUsumCopy={copyText}
        onWalletCopy={copyText}
      />
    </>
  );
};

export default WalletPopoverDemo;
