import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { Address } from 'wagmi';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { usePositions } from './usePositions';

interface Props {
  marketAddress: Address;
  positionId: bigint;
}

function useClosePosition(props: Props) {
  const { marketAddress, positionId } = props;
  const { client } = useChromaticClient();
  const { positions, fetchPositions } = usePositions();

  const onClosePosition = async function () {
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (isNil(position)) {
      errorLog('no positions');
      toast('Position is not selected.');
      return AppError.reject('no positions', 'onClosePosition');
    }
    try {
      const routerApi = client.router();
      await routerApi?.closePosition(position.marketAddress, position.id);

      await fetchPositions();
      toast('The closing process has been started.');
    } catch (error) {
      errorLog(error);
      toast.error('Transaction rejected.');

      return AppError.reject(error, 'onClosePosition');
    }
  };

  return {
    onClosePosition,
  };
}

export { useClosePosition };
