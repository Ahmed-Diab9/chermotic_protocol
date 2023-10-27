import axios from 'axios';
import { isNotNil } from 'ramda';
import useSWRMutation from 'swr/mutation';
import { useAccount } from 'wagmi';
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
      const response = await axios.post('/airdrops/assets/sync-zealy', {
        address,
      });
      if (isNotNil((response.data as SyncZealy).synced_count)) {
        return;
      } else {
        throw new Error('Error found in sync');
      }
    }
  );

  return {
    synchronize,
    isMutating,
  };
};
