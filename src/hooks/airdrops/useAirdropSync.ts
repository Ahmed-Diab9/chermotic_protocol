import { isNotNil } from 'ramda';
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
  const { trigger: synchronize, isMutating } = useSWRMutation(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address }) => {
      const response = await airdropClient.post('/airdrop/assets/sync-zealy', {
        address,
      });
      if (isNotNil((response.data as SyncZealy).synced_count)) {
        
      } else {
        if (response.data.message === 'WALLET_NOT_LINKED_TO_ZEALY') {
          //TODO show popup
        }
        throw new Error('Error found in sync');
      }
    }
  );

  return {
    synchronize,
    isMutating,
  };
};
