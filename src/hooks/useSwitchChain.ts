import { useCallback } from 'react';
import { useAccount, useChainId, useSwitchNetwork } from 'wagmi';

const useSwitchChain = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchNetworkAsync } = useSwitchNetwork();

  const onChainSwitch = useCallback(async () => {
    if (isConnected) {
      await switchNetworkAsync?.(chainId);
    } else {
      window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }],
      });
    }
  }, [isConnected, chainId, switchNetworkAsync]);

  return { onChainSwitch };
};

export { useSwitchChain };
