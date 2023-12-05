import { useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { AppError } from '~/typings/error';
import { Market } from '~/typings/market';
import { Position } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { errorLog } from '~/utils/log';
import useMarketOracle from './commons/useMarketOracle';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { usePositions } from './usePositions';

interface Props {
  market?: Market;
  position?: Position;
}

export function useClaimPosition(props: Props) {
  const { market, position } = props;
  const { client, isReady } = useChromaticClient();
  const { fetchBalances } = useChromaticAccount();
  const { currentOracle } = useMarketOracle({ market });
  const { fetchCurrentPositions } = usePositions();
  const mutationKey = useMemo(() => {
    return { key: 'useClaimPosition', market, position, currentOracle };
  }, [market, position, currentOracle]);

  const {
    trigger: onClaimPosition,
    error,
    isMutating,
  } = useSWRMutation(
    isReady && checkAllProps(mutationKey) ? mutationKey : undefined,
    async ({ position, market, currentOracle }) => {
      try {
        if (currentOracle.version <= position.closeVersion) {
          errorLog('the selected position is not closed');
          toast('This position is not closed yet.');
          return AppError.reject('the selected position is not closed', 'onClaimPosition');
        }
        const routerApi = client.router();
        await routerApi.claimPosition(market?.address, position.id);

        await fetchCurrentPositions(position.marketAddress);
        await fetchBalances();
        toast('The claiming process has been completed.');
      } catch (error) {
        toast.error('Transaction rejected.');
      }
    }
  );

  useError({ error });

  return {
    onClaimPosition,
    isMutating,
  };
}
