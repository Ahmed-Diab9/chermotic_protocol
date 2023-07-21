import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { Address } from 'wagmi';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import useOracleVersion from './useOracleVersion';
import { usePositions } from './usePositions';
import { useUsumAccount } from './useUsumAccount';

interface Props {
  marketAddress: Address;
  positionId: bigint;
}

export function useClaimPosition(props: Props) {
  const { marketAddress, positionId } = props;
  const { client } = useChromaticClient();
  const { fetchBalances } = useUsumAccount();
  const { allMarket:allPositions } = usePositions();
  const { positions, fetchPositions } = allPositions;
  const { oracleVersions } = useOracleVersion();
  const onClaimPosition = async function () {
    try {
      const routerApi = client?.router();
      if (isNil(routerApi)) {
        return AppError.reject('no router contractsd', 'onClaimPosition');
      }
      const position = positions?.find(
        (position) => position.marketAddress === marketAddress && position.id === positionId
      );
      if (isNil(position)) {
        errorLog('no positions');
        toast('Positions are not selected.');
        return AppError.reject('no positions', 'onClosePosition');
      }
      if ((oracleVersions?.[marketAddress]?.version || 0n) <= position.closeVersion) {
        errorLog('the selected position is not closed');
        toast('This position is not closed yet.');
        return AppError.reject('the selected position is not closed', 'onClaimPosition');
      }
      await routerApi.claimPosition(marketAddress, position.id);

      await fetchPositions();
      await fetchBalances();
    } catch (error) {
      toast.error(String(error));
    }
  };

  return {
    onClaimPosition,
  };
}
