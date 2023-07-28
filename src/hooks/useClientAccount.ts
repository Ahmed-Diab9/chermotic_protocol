import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { useChromaticClient } from './useChromaticClient';

function useClientAccount() {
  const { data: walletClient } = useWalletClient();

  const { client } = useChromaticClient();

  return useMemo(() => {
    const address = walletClient?.account?.address;
    return {
      address: address !== '0x' ? address : undefined,
    };
  }, [client?.walletClient]);
}

export default useClientAccount;
