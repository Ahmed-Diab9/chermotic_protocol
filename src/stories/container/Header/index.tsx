import { useAccount, useConnect } from 'wagmi';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { Header as HeaderPresenter } from '~/stories/template/Header';

export const Header = () => {
  const { address: walletAddress } = useAccount();
  const { accountAddress: chromaticAccountAddress } = useChromaticAccount();
  const { connectAsync, connectors } = useConnect();

  return (
    <HeaderPresenter
      account={{ walletAddress, usumAddress: chromaticAccountAddress }}
      onConnect={() => {
        connectAsync({ connector: connectors[0] });
      }}
    />
  );
};
