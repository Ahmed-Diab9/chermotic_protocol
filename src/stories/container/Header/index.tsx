import { useAccount, useConnect } from 'wagmi';
import { useChainListener } from '~/hooks/useChainListener';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { Header as HeaderPresenter } from '~/stories/template/Header';

export const Header = () => {
  const { address: walletAddress } = useAccount();
  const { accountAddress: chromaticAddress } = useChromaticAccount();
  const { connectAsync, connectors } = useConnect();
  const { isSameChain } = useChainListener();

  return (
    <HeaderPresenter
      account={{ walletAddress, chromaticAddress }}
      isSameChain={isSameChain}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
    />
  );
};
