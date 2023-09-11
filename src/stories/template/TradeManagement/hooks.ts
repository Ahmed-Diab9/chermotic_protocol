import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';

import { useLastOracle } from '~/hooks/useLastOracle';
import { useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';
import { useTradeHistory } from '~/hooks/useTradeHistory';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';

import { abs, divPreserved, formatDecimals } from '~/utils/number';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  second: '2-digit',
  minute: '2-digit',
  hour: '2-digit',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour12: false,
}).format;

export function useTradeManagement() {
  const { currentMarket } = useMarket();
  const { positions, isLoading } = usePositions();
  const { history, isLoading: isHistoryLoading } = useTradeHistory();
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

  const lastOracle = useLastOracle();

  const currentPrice = isNotNil(currentMarket)
    ? formatDecimals(currentMarket.oracleValue.price, 18, 2, true)
    : '-';

  const isPositionsEmpty = isNil(positions) || positions.length === 0;
  const positionList = positions || [];

  const historyList = useMemo(() => {
    if (isNil(history)) {
      return;
    }
    return history
      .filter((historyValue) => historyValue.isClaimed)
      .map((historyValue) => {
        return {
          token: historyValue.token,
          market: historyValue.market,
          positionId: historyValue.positionId,
          direction: historyValue.direction,
          collateral:
            formatDecimals(historyValue.collateral, historyValue.token.decimals) +
            ' ' +
            historyValue.token.name,
          qty:
            formatDecimals(abs(historyValue.qty), historyValue.token.decimals) +
            ' ' +
            historyValue.token.name,
          entryPrice:
            '$' + formatDecimals(historyValue.entryPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
          leverage:
            formatDecimals(historyValue.leverage, historyValue.token.decimals, 2, true) + 'x',
          pnl:
            formatDecimals(historyValue.pnl, historyValue.token.decimals) +
            ' ' +
            historyValue.token.name,
          pnlRate:
            formatDecimals(
              divPreserved(
                historyValue.pnl,
                historyValue.collateral,
                PNL_RATE_DECIMALS + PERCENT_DECIMALS
              ),
              PNL_RATE_DECIMALS,
              2,
              true
            ) + '%',
          entryTime: dateFormat(new Date(Number(historyValue.entryTimestamp) * 1000)),
          closeTime: dateFormat(new Date(Number(historyValue.closeTimestamp) * 1000)),
        };
      });
  }, [history]);

  const tradeList = useMemo(() => {
    return history?.map((historyValue) => {
      return {
        token: historyValue.token,
        market: historyValue.market,
        positionId: historyValue.positionId,
        direction: historyValue.direction,
        collateral:
          formatDecimals(historyValue.collateral, historyValue.token.decimals) +
          ' ' +
          historyValue.token.name,
        qty:
          formatDecimals(abs(historyValue.qty), historyValue.token.decimals) +
          ' ' +
          historyValue.token.name,
        entryPrice:
          '$' + formatDecimals(historyValue.entryPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
        leverage: formatDecimals(historyValue.leverage, historyValue.token.decimals, 2, true) + 'x',
        entryTime: dateFormat(new Date(Number(historyValue.entryTimestamp) * 1000)),
      };
    });
  }, [history]);

  return {
    openButtonRef,
    popoverRef,
    isGuideVisible,

    lastOracle,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,

    isHistoryLoading,
    historyList,
    tradeList,
  };
}
