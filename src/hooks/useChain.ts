import { useMemo } from 'react';
import { usePublicClient, useNetwork, useSwitchNetwork } from 'wagmi';

function useChain() {
  const { chain: targetChain } = usePublicClient();
  const { chain: currentChain } = useNetwork();
  const { switchNetwork: switchTo } = useSwitchNetwork();

  const isWrongChain = useMemo(() => targetChain.id !== currentChain?.id, [currentChain]);

  function switchNetwork() {
    switchTo?.(targetChain.id);
  }

  return {
    isWrongChain,
    targetChain,
    currentChain,
    switchNetwork,
  };
}

export default useChain;
