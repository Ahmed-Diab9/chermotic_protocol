import { useLocation } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { useChain } from '~/hooks/useChain';

import { ADDRESS_ZERO, trimAddress } from '~/utils/address';

export function useHeader() {
  const { address, isConnected: _isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { isWrongChain: _isWrongChain, switchChain: onSwitchChain } = useChain();

  const location = useLocation();
  function isActiveLink(path: string) {
    return location.pathname === `/${path}`;
  }

  const isConnected = _isConnected && !_isWrongChain;
  const isWrongChain = _isConnected && _isWrongChain;
  const isDisconnected = !_isConnected;

  const walletAddress = trimAddress(address || ADDRESS_ZERO, 7, 5);

  function onConnect() {
    return connectAsync({ connector: connectors[0] });
  }

  return {
    isActiveLink,

    isConnected,
    isWrongChain,
    isDisconnected,

    walletAddress,

    onConnect,
    onSwitchChain,
  };
}
