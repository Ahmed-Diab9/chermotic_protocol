import { AxiosError } from 'axios';
import { useCallback } from 'react';
import useSWRMutation from 'swr/mutation';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { SyncZealy } from '~/typings/airdrop';
import { checkAllProps } from '~/utils';

export const useAirdropSync = () => {
  const { address } = useAccount();
  const fetchKey = {
    address,
    key: 'fetchAirdropSync',
  };
  const {
    trigger: synchronize,
    isMutating,
    data: syncState,
    reset,
  } = useSWRMutation(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    try {
      const response = await airdropClient.post('/airdrop/assets/sync-zealy', {
        address,
      });
      const { synced_xp: xp, synced_count: count } = response.data as SyncZealy;
      if (xp > 0) {
        return {
          credit: xp,
          xp,
          isZealyConnected: true,
          title: 'Successfully converted!',
          content: 'Your Zealy XP has been successfully converted to\nChromatic airdrop Credit.',
        };
      }
      if (xp === 0) {
        // TODO: Should check the content more valuable.
        return {
          credit: xp,
          xp,
          isZealyConnected: true,
          // title: 'No updates',
          content: 'The number of Zealy XP has not been changed since last update.',
        };
      }
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        console.error(error);
        return;
      }
      const { response } = error;
      if (response?.data.message === 'WALLET_NOT_LINKED_TO_ZEALY') {
        return {
          isFailed: true,
        };
      }
    }
  });

  const onModalClose = useCallback(() => {
    reset();
  }, [reset]);

  const onZealyConnect = useCallback(() => {
    const anchor = document.createElement('a');
    anchor.href = 'https://zealy.io/cw/_/settings/linked-accounts' satisfies `https://${string}`;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    anchor.click();
    onModalClose();
  }, [onModalClose]);

  const onZealyNavigate = () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://zealy.io/cw/_/settings/linked-accounts' satisfies `https://${string}`;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    anchor.click();
  };

  return {
    syncState,
    isMutating,
    synchronize,
    onZealyConnect,
    onZealyNavigate,
    onModalClose,
  };
};
