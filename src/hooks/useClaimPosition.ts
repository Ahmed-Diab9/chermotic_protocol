import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { AppError } from '~/typings/error';
import { Market } from '~/typings/market';
import { errorLog } from '~/utils/log';
import useMarketOracle from './commons/useMarketOracle';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { usePositions } from './usePositions';

interface Props {
  market?: Market;
  positionId: bigint;
}

export function useClaimPosition(props: Props) {
  const { market, positionId } = props;
  const { client } = useChromaticClient();
  const { fetchBalances } = useChromaticAccount();
  const { currentOracle } = useMarketOracle({ market });
  const { positions, fetchPositions, fetchCurrentPositions } = usePositions();
  async function onClaimPosition() {
    try {
      if (isNil(market)) {
        return AppError.reject('No markets', 'onClaimPosition');
      }
      const position = positions?.find(
        (position) => position.marketAddress === market?.address && position.id === positionId
      );
      if (isNil(position)) {
        errorLog('no positions');
        toast('Positions are not selected.');
        return AppError.reject('no positions', 'onClosePosition');
      }
      if ((currentOracle?.version || 0n) <= position.closeVersion) {
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

  return {
    onClaimPosition,
  };
}
