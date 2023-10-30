import { useCallback } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { AirdropAsset } from '~/typings/airdrop';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';

export const useAirdropAssets = () => {
  const { address } = useAccount();
  const fetchKey = {
    key: 'fetchAirdropAssets',
    walletAddress: address,
  };
  const {
    data: airdropAssets,
    error,
    isLoading,
    mutate,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ walletAddress }) => {
    const response = await airdropClient.get(`/airdrop/assets?address=${walletAddress}`);
    const data = response.data as AirdropAsset;

    return data;
  });

  const refreshAssets = useCallback(() => {
    mutate();
  }, [mutate]);

  useError({ error });

  return { airdropAssets, isLoading, refreshAssets };
};
