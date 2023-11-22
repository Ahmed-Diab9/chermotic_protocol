import { isNotNil } from 'ramda';
import { useAccount, useConnect } from 'wagmi';

import { useChain } from '~/hooks/useChain';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { trimAddress } from '~/utils/address';

export function useWalletPopoverV3() {
  const { connectAsync, connectors } = useConnect();
  const { address } = useAccount();
  const { isChromaticBalanceLoading } = useChromaticAccount();
  const { isTokenBalanceLoading } = useTokenBalances();
  const { switchChain } = useChain();

  const isLoading = isTokenBalanceLoading || isChromaticBalanceLoading;
  const walletAddress = isNotNil(address) ? trimAddress(address, 7, 5) : '-';

  function onConnect() {
    return connectAsync({ connector: connectors[0] });
  }
  function onSwitchChain() {
    return switchChain();
  }

  return {
    onConnect,
    onSwitchChain,

    isLoading,
    walletAddress,
  };
}
