import { isNil } from 'ramda';
import { useMemo } from 'react';
import { Address, usePublicClient } from 'wagmi';

interface UseBlockExplorer {
  path?: string;
  address?: Address;
}

export const useBlockExplorer = (props?: UseBlockExplorer) => {
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
  const explorerUrl = useMemo(() => {
    if (isNil(props)) {
      return blockExplorer;
    }
    const { path, address } = props;
    return `${blockExplorer}/${path}/${address}`;
  }, [blockExplorer, props]);

  return explorerUrl;
};
