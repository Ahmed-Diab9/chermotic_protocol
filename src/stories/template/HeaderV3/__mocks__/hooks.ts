import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useChain } from '~/hooks/useChain';

export function useHeader3() {
  const { isConnected: _isConnected } = useAccount();
  const { isWrongChain: _isWrongChain } = useChain();

  const location = useLocation();
  function isActiveLink(path: string) {
    return location.pathname === `/${path}`;
  }

  const isWrongChain = _isConnected && _isWrongChain;
  const isDisconnected = !_isConnected;

  const walletPopoverProps = {
    isWrongChain,
    isDisconnected,
  };

  return {
    isActiveLink,

    walletPopoverProps,
  };
}
