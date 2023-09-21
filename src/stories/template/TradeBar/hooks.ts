import { isNil, isNotNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { useLastOracle } from '~/hooks/useLastOracle';
import { useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';

import { formatDecimals } from '~/utils/number';

export function useTradeBar() {
  const { currentMarket } = useMarket();
  const { positions, isLoading } = usePositions();
  const previousOracle = usePrevious(currentMarket?.oracleValue.version);
  const openingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.OPENING).length ?? 0
  );
  const closingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.CLOSING).length ?? 0
  );

  useEffect(() => {
    if (isNil(previousOracle) || isNil(currentMarket)) {
      return;
    }
    if (previousOracle !== currentMarket.oracleValue.version) {
      if (isNotNil(openingPositionSize) && openingPositionSize > 0) {
        toast.info('The opening process has been completed.');
      }
      if (isNotNil(closingPositionSize) && closingPositionSize > 0) {
        toast.info('The closing process has been completed.');
      }
    }
  }, [currentMarket, previousOracle, openingPositionSize, closingPositionSize]);

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isGuideVisible, setGuideVisible] = useState(false);

  useEffect(() => {
    function onTrade() {
      if (isNotNil(openButtonRef.current) && isNil(popoverRef.current)) {
        setGuideVisible(true);
        openButtonRef.current.click();
      }
    }
    window.addEventListener(TRADE_EVENT, onTrade);
    return () => {
      window.removeEventListener(TRADE_EVENT, onTrade);
    };
  }, []);

  const { formattedElapsed } = useLastOracle();

  const currentPrice = isNotNil(currentMarket)
    ? formatDecimals(currentMarket.oracleValue.price, 18, 2, true)
    : '-';

  const isPositionsEmpty = isNil(positions) || positions.length === 0;
  const positionList = positions || [];

  return {
    openButtonRef,
    popoverRef,
    isGuideVisible,

    formattedElapsed,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,
  };
}
