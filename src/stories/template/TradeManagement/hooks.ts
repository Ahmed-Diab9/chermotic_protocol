import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import useMarketOracle from '~/hooks/commons/useMarketOracle';
import useMarkets from '~/hooks/commons/useMarkets';

import { useLastOracle } from '~/hooks/useLastOracle';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';
import { useTradeHistory } from '~/hooks/useTradeHistory';
import { useTradeLogs } from '~/hooks/useTradeLogs';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';
import { formatTimestamp } from '~/utils/date';

import { abs, divPreserved, formatDecimals } from '~/utils/number';

export function useTradeManagement() {
  const { currentMarket } = useMarkets();
  const { currentOracle } = useMarketOracle({ market: currentMarket });
  const { positions, isLoading } = usePositions();
  const { history, isLoading: isHistoryLoading } = useTradeHistory();
  const { trades, isLoading: isTradeLogsLoading } = useTradeLogs();
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

  const historyBottomRef = useRef<HTMLDivElement | null>(null);
  const isHistoryRendered = isNotNil(historyBottomRef.current);
  const onFetchNextHistory = () => {};
  const onFetchNextTrade = () => {};
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isHistoryLoading) {
            onFetchNextHistory();
          }
        });
      },
      { root: null, threshold: 0 }
    );
    if (isHistoryRendered) {
      observer.observe(historyBottomRef.current as HTMLDivElement);
    }
    return () => {
      observer.disconnect();
    };
  }, [isHistoryRendered, isHistoryLoading]);

  const tradeBottomRef = useRef<HTMLDivElement | null>(null);
  const isTradeLogsRendered = isNotNil(tradeBottomRef.current);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isTradeLogsLoading) {
            onFetchNextTrade();
          }
        });
      },
      { root: null, threshold: 0 }
    );
    if (isTradeLogsRendered) {
      observer.observe(tradeBottomRef.current as HTMLDivElement);
    }
    return () => {
      observer.disconnect();
    };
  }, [isTradeLogsRendered, isTradeLogsLoading]);

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

  const historyList = useMemo(() => {
    if (isNil(history)) {
      return;
    }
    return history
      .sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1))
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
          qty: formatDecimals(abs(historyValue.qty), historyValue.token.decimals, 2),
          entryPrice:
            '$ ' + formatDecimals(historyValue.entryPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
          leverage:
            formatDecimals(historyValue.leverage, historyValue.token.decimals, 2, true) + 'x',
          pnl:
            formatDecimals(historyValue.pnl, historyValue.token.decimals, 2) +
            ' ' +
            historyValue.token.name,
          pnlRate:
            (historyValue.pnl > 0n ? '+' : '') +
            formatDecimals(
              divPreserved(
                historyValue.pnl,
                historyValue.collateral,
                PNL_RATE_DECIMALS + PERCENT_DECIMALS
              ),
              PNL_RATE_DECIMALS,
              2,
              true
            ) +
            '%',
          pnlClass: historyValue.pnl > 0n ? '!text-price-higher' : '!text-price-lower',
          entryTime: formatTimestamp(historyValue.entryTimestamp),
          closeTime: formatTimestamp(historyValue.closeTimestamp),
        };
      });
  }, [history]);

  const tradeList = useMemo(() => {
    return trades
      ?.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1))
      .map((tradeLog) => ({
        token: tradeLog.token,
        market: tradeLog.market,
        positionId: tradeLog.positionId,
        direction: tradeLog.direction,
        collateral:
          formatDecimals(tradeLog.collateral, tradeLog.token.decimals) + ' ' + tradeLog.token.name,
        qty: formatDecimals(abs(tradeLog.qty), tradeLog.token.decimals, 2),
        entryPrice: '$ ' + formatDecimals(tradeLog.entryPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
        leverage: formatDecimals(tradeLog.leverage, tradeLog.token.decimals, 2, true) + 'x',
        entryTime: formatTimestamp(tradeLog.entryTimestamp),
        blockNumber: tradeLog.blockNumber,
      }));
  }, [trades]);

  const hasMoreHistory = false;
  const hasMoreTrades = false;

  const onLoadHistoryRef = useCallback((element: HTMLDivElement | null) => {
    historyBottomRef.current = element;
  }, []);
  const onLoadTradesRef = useCallback((element: HTMLDivElement | null) => {
    tradeBottomRef.current = element;
  }, []);

  return {
    openButtonRef,
    popoverRef,
    isGuideVisible,

    formattedElapsed,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,

    historyBottomRef,
    tradeBottomRef,
    isHistoryLoading,
    historyList,
    tradeList,
    hasMoreHistory,
    hasMoreTrades,
    onFetchNextTrade,
    onFetchNextHistory,
    onLoadHistoryRef,
    onLoadTradesRef,
  };
}
