import { isNil } from 'ramda';
import { useCallback } from 'react';
import { useAccount, useChainId, useConnect, useSwitchNetwork } from 'wagmi';
import { errorLog } from '~/utils/log';

const useSwitchChain = () => {
  const chainId = useChainId();
  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { switchNetworkAsync } = useSwitchNetwork();

  const onChainSwitch = useCallback(async () => {
    if (isConnected) {
      if (isNil(switchNetworkAsync)) {
        errorLog('Error on calling a function');
      }
      await switchNetworkAsync?.(chainId);
    } else {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }],
      });
      await connectAsync({ connector: connectors[0] });
    }
  }, [isConnected, chainId, connectors, switchNetworkAsync, connectAsync]);

  return { onChainSwitch };
};

export { useSwitchChain };
