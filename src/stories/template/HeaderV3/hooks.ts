import { isNotNil } from 'ramda';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useChain } from '~/hooks/useChain';

export function useHeaderV3() {
  const { isConnected: _isConnected, address } = useAccount();
  const { isWrongChain: _isWrongChain } = useChain();

  const location = useLocation();
  function isActiveLink(path: string) {
    return location.pathname === `/${path}`;
  }
  const isTradePage = useMemo(() => {
    if (location.pathname.includes('trade')) {
      return true;
    }
    return false;
  }, [location]);

  const isWrongChain = _isConnected && _isWrongChain;
  const isDisconnected = !_isConnected;

  const walletPopoverProps = {
    isWrongChain,
    isDisconnected,
  };

  return {
    address,
    hasAccount: isNotNil(address) && isTradePage,
    isActiveLink,

    walletPopoverProps,
  };
}
