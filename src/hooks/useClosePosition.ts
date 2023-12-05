import { isNil } from 'ramda';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { Address } from 'wagmi';
import { AppError } from '~/typings/error';
import { checkAllProps } from '~/utils';
import { errorLog } from '~/utils/log';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { usePositions } from './usePositions';

interface Props {
  marketAddress?: Address;
  positionId?: bigint;
}

function useClosePosition(props: Props) {
  const { marketAddress, positionId } = props;
  const { client, isReady } = useChromaticClient();
  const { fetchCurrentPositions } = usePositions();
  const { fetchBalances } = useChromaticAccount();

  const mutationKey = useMemo(() => {
    return {
      key: 'useClosePosition',
      marketAddress,
      positionId,
    };
  }, [marketAddress, positionId]);

  const {
    trigger: onClosePosition,
    isMutating,
    error,
  } = useSWRMutation(
    isReady && checkAllProps(mutationKey) ? mutationKey : undefined,
    async ({ marketAddress, positionId }) => {
      if (isNil(positionId) || isNil(marketAddress)) {
        return;
      }
      try {
        const routerApi = client.router();
        await routerApi?.closePosition(marketAddress, positionId);

        await fetchCurrentPositions(marketAddress);
        await fetchBalances();
        toast('The closing process has started.');
      } catch (error) {
        errorLog(error);
        toast.error('Transaction rejected.');

        return AppError.reject(error, 'onClosePosition');
      }
    }
  );

  useError({ error });

  return {
    onClosePosition,
    isMutating,
  };
}

export { useClosePosition };
