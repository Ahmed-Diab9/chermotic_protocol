import { isNil } from 'ramda';
import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';

export const useBlockExplorer = () => {
  const publicClient = usePublicClient();
  const blockExplorer = useMemo(() => {
    try {
      const rawUrl = publicClient.chain.blockExplorers?.default?.url;
      if (isNil(rawUrl)) {
        return;
      }
      return new URL(rawUrl).origin;
    } catch (error) {
      return;
    }
  }, [publicClient]);

  return blockExplorer;
};
