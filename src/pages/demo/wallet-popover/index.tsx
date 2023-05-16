import { useAccount } from "wagmi";
import { WalletPopover } from "../../../stories/molecule/WalletPopover";
import useUsumAccount from "../../../hooks/useUsumAccount";
import { copyText } from "../../../utils/clipboard";
import { tokensMock } from "../../../mock";
import usePriceFeed from "../../../hooks/usePriceFeed";
import useConnectOnce from "../../../hooks/useConnectOnce";

const WalletPopoverDemo = () => {
  useConnectOnce();
  const { address: walletAddress } = useAccount();
  const [usumAddress, fetchAddress, createAddress] = useUsumAccount();
  const connectOnce = useConnectOnce();
  const tokens = tokensMock;
  const [feed] = usePriceFeed();

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
