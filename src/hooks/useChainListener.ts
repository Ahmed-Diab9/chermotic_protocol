import { useCallback, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import 'wagmi/window';

export const useChainListener = () => {
  const chainId = useChainId();
  const [isSameChain, setIsSameChain] = useState<boolean>();

  useEffect(() => {
    const onChainChange = (currentChainId: string) => {
      const isSameChain = chainId === Number(currentChainId);
      setIsSameChain(isSameChain);
    };
    window.ethereum?.on('chainChanged', onChainChange);
    return () => {
      window.ethereum?.removeListener('chainChanged', onChainChange);
    };
  }, [chainId]);

  const onMount = useCallback(() => {
    window.ethereum?.request({ method: 'eth_chainId' }).then((currentChainId) => {
      const isSameChain = chainId === Number(currentChainId);
      setIsSameChain(isSameChain);
    });
  }, [chainId]);

  useEffect(() => {
    onMount();
  }, [onMount]);

  return { isSameChain };
};
