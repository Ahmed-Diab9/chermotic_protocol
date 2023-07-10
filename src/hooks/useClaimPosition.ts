import { BigNumber } from 'ethers';
import { useChromaticClient } from './useChromaticClient';
import { AppError } from '~/typings/error';
import { isNil } from 'ramda';
import { usePosition } from './usePosition';
import { errorLog } from '~/utils/log';
import { toast } from 'react-toastify';
import useOracleVersion from './useOracleVersion';
import { useUsumAccount } from './useUsumAccount';
import { Address } from 'wagmi';

interface Props {
  marketAddress: Address;
  positionId: bigint;
}

function useClaimPosition(props: Props) {
  const { marketAddress, positionId } = props;
  const { client } = useChromaticClient();
  const { fetchBalances } = useUsumAccount();
  const { positions, fetchPositions } = usePosition();
  const { oracleVersions } = useOracleVersion();
  const onClaimPosition = async function () {
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
    await routerApi.claimPosition(marketAddress, positionId);

    await fetchPositions();
    await fetchBalances();
  };

  return {
    onClaimPosition,
  };
}

export { useClaimPosition };
