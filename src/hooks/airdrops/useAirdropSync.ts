import { AxiosError } from 'axios';
import { isNotNil } from 'ramda';
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
      if (isNotNil(xp)) {
        return {
          credit: xp,
          xp,
          isZealyConnected: true,
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
