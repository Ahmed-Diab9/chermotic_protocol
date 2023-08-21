import { useAccount, useConnect } from 'wagmi';
import useChain from '~/hooks/useChain';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { Header as HeaderPresenter } from '~/stories/template/Header';

export const Header = () => {
  const { address: walletAddress, isConnected } = useAccount();
  const { accountAddress: chromaticAddress } = useChromaticAccount();
  const { connectAsync, connectors } = useConnect();
  const { isWrongChain } = useChain();

  return (
    <HeaderPresenter
      account={{ walletAddress, chromaticAddress }}
      isConnected={isConnected}
      isWrongChain={isWrongChain}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
    />
  );
};
