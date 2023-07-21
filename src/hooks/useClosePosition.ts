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
  const { allMarket: allPositions } = usePositions();
  const { positions, fetchPositions } = allPositions;

  const onClosePosition = async function () {
    if (isNil(client?.router())) {
      errorLog('no router contracts');
      return AppError.reject('no router contracts', 'onClosePosition');
    }
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (isNil(position)) {
      errorLog('no positions');
      toast('Position is not selected.');
      return AppError.reject('no positions', 'onClosePosition');
    }
    try {
      await client?.router()?.closePosition(position.marketAddress, position.id);

      fetchPositions();
    } catch (error) {
      errorLog(error);
      toast('Position was not deleted, Found error.');

      return AppError.reject(error, 'onClosePosition');
    }
  };

  return {
    onClosePosition,
  };
}

export { useClosePosition };
