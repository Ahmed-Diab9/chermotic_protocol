import { isNil } from 'ramda';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { TradeBar as TradeBarPresenter } from '~/stories/template/TradeBar';
import { CLOSING, OPENING } from '~/typings/position';
import { isValid } from '~/utils/valid';

export const TradeBar = () => {
  const { currentToken } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { positions, isLoading } = usePositions();
  const previousOracle = usePrevious(currentMarket?.oracleValue.version);
  const openingPositionSize = usePrevious(
    positions?.filter((position) => position.status === OPENING).length ?? 0
  );
  const closingPositionSize = usePrevious(
    positions?.filter((position) => position.status === CLOSING).length ?? 0
  );

  useEffect(() => {
    if (isNil(previousOracle) || isNil(currentMarket)) {
      return;
    }
    if (previousOracle !== currentMarket.oracleValue.version) {
      if (isValid(openingPositionSize) && openingPositionSize > 0) {
        toast.info('The opening process has been completed.');
      }
      if (isValid(closingPositionSize) && closingPositionSize > 0) {
        toast.info('The closing process has been completed.');
      }
    }
  }, [currentMarket, previousOracle, openingPositionSize, closingPositionSize]);

  return (
    <TradeBarPresenter
      token={currentToken}
      markets={markets}
      market={currentMarket}
      positions={positions}
      isLoading={isLoading}
    />
  );
};
