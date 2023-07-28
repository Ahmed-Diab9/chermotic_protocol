import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { Address } from 'wagmi';
import { AppError } from '~/typings/error';
import { errorLog } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import useOracleVersion from './useOracleVersion';
import { usePositions } from './usePositions';
import { useChromaticAccount } from './useChromaticAccount';

interface Props {
  marketAddress: Address;
  positionId: bigint;
}

export function useClaimPosition(props: Props) {
  const { marketAddress, positionId } = props;
  const { client } = useChromaticClient();
  const { fetchBalances } = useChromaticAccount();
  const { positions, fetchPositions } = usePositions();
  const { oracleVersions } = useOracleVersion();
  const onClaimPosition = async function () {
    try {
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
      const routerApi = client.router();
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
