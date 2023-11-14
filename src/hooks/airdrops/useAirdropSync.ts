import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
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
  const [isOpened, setIsOpened] = useState(false);
  const {
    trigger: synchronize,
    isMutating,
    data: syncState,
  } = useSWRMutation(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    setIsOpened(true);
    try {
      const response = await airdropClient.post('/airdrop/assets/sync-zealy', {
        address,
      });
      const { synced_xp: xp } = response.data as SyncZealy;
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
          title: 'No changes',
          content: 'Your Zealy XP would be same as current credit.',
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
    setIsOpened(false);
  }, []);

  const onZealyConnect = useCallback(() => {
    const anchor = document.createElement('a');
    anchor.href = 'https://zealy.io/cw/_/settings/linked-accounts' satisfies `https://${string}`;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    anchor.click();
    onModalClose();
  }, [onModalClose]);

  return {
    syncState,
    isMutating,
    isOpened,
    synchronize,
    onZealyConnect,
    onModalClose,
  };
};
