import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';

export const useAirdropAccounts = () => {
  const { address } = useAccount();
  const fetchKey = { address, key: 'fetchAirdropAccounts' };
  const {
    data: verifiedAddress,
    error,
    isLoading,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    const response = await airdropClient.get(`/airdrop/accounts?address=${address}`);
    const data = response.data as { message: string; verified: boolean; verifiedAddress?: Address };

    return data.verifiedAddress;
  });

  useError({ error });

  return { verifiedAddress, isLoading };
};
