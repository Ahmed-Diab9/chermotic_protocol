import { isNil, isNotNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useMarketOracle from '~/hooks/commons/useMarketOracle';
import useMarkets from '~/hooks/commons/useMarkets';

import { useLastOracle } from '~/hooks/useLastOracle';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';

import { formatDecimals } from '~/utils/number';

export function useTradeBar() {
  const { currentMarket } = useMarkets();
  const { currentOracle } = useMarketOracle({ market: currentMarket });
  const { positions, isLoading } = usePositions();
  const previousOracle = usePrevious(currentOracle?.version);
  const openingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.OPENING).length ?? 0
  );
  const closingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.CLOSING).length ?? 0
  );

  useEffect(() => {
    if (isNil(previousOracle) || isNil(currentOracle)) {
      return;
    }
    if (previousOracle !== currentOracle?.version) {
      if (isNotNil(openingPositionSize) && openingPositionSize > 0) {
        toast.info('The opening process has been completed.');
      }
      if (isNotNil(closingPositionSize) && closingPositionSize > 0) {
        toast.info('The closing process has been completed.');
      }
    }
  }, [currentOracle, previousOracle, openingPositionSize, closingPositionSize]);

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
    ? formatDecimals(currentOracle?.price, 18, 2, true)
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
