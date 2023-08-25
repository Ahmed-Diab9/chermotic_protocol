import { useMemo } from 'react';
import { useNetwork, useAccount, useSwitchNetwork } from 'wagmi';

import { CHAINS_WAGMI, CHAIN } from '~/constants/contracts';

export function useChain() {
  const { isConnected } = useAccount();
  const { chain: currentChain } = useNetwork();
  const targetChain = CHAINS_WAGMI[CHAIN];

  const isWrongChain = useMemo(
    () => isConnected && targetChain.id !== currentChain?.id,
    [isConnected, currentChain]
  );

  const { switchNetwork } = useSwitchNetwork({ chainId: targetChain.id });

  function switchChain(_?: unknown) {
    switchNetwork?.();
  }

  return {
    isWrongChain,
    targetChain,
    currentChain,
    switchChain,
  };
}
