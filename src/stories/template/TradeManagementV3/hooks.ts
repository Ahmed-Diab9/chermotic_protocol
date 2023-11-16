import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import { PAGE_SIZE } from '~/constants/arbiscan';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';

import { useLastOracle } from '~/hooks/useLastOracle';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';
import { useTradeHistory } from '~/hooks/useTradeHistory';
import { useTradeLogs } from '~/hooks/useTradeLogs';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';
import { formatTimestamp } from '~/utils/date';
import { compareMarkets } from '~/utils/market';

import { abs, divPreserved, formatDecimals } from '~/utils/number';

const wait = async (ms: number = 1000) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined!);
    }, ms);
  });
};

export function useTradeManagementV3() {
  const { currentMarket } = useMarket();
  const { markets } = useEntireMarkets();
  const previousMarkets = usePrevious(markets);
  const { positions, isLoading, fetchPositions } = usePositions();
  const { history, isLoading: isHistoryLoading, refreshTradeHistory } = useTradeHistory();
  const { trades, isLoading: isTradeLogsLoading, refreshTradeLogs } = useTradeLogs();
  const { fetchBalances } = useChromaticAccount();
  const [pages, setPages] = useState({ history: 1, trades: 1 });
  const [isLoadings, setIsLoadings] = useState({ history: false, trades: false });

  const openingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.OPENING).length ?? 0
  );
  const closingPositionSize = usePrevious(
    positions?.filter((position) => position.status === POSITION_STATUS.CLOSING).length ?? 0
  );

  useEffect(() => {
    if (isNil(previousMarkets) || isNil(markets)) {
      return;
    }
    const isVersionUpdated = compareMarkets(previousMarkets, markets);
    if (isVersionUpdated) {
      if (isNotNil(openingPositionSize) && openingPositionSize > 0) {
        toast.info('The opening process has been completed.');
        fetchPositions();
        fetchBalances();
      }
      if (isNotNil(closingPositionSize) && closingPositionSize > 0) {
        toast.info('The closing process has been completed.');
        fetchPositions();
        fetchBalances();
      }
    }
  }, [
    markets,
    previousMarkets,
    openingPositionSize,
    closingPositionSize,
    fetchBalances,
    fetchPositions,
  ]);

  const onFetchNextHistory = async () => {
    setIsLoadings((loadingState) => ({
      ...loadingState,
      history: true,
    }));
    await wait(3000);
    setPages((pages) => ({ ...pages, history: pages.history + 1 }));
    setIsLoadings((loadingState) => ({
      ...loadingState,
      history: false,
    }));
  };

  const onFetchNextTrade = async () => {
    setIsLoadings((loadingState) => ({
      ...loadingState,
      trades: true,
    }));
    await wait(3000);
    setPages((pages) => ({ ...pages, trades: pages.trades + 1 }));
    setIsLoadings((loadingState) => ({
      ...loadingState,
      trades: false,
    }));
  };

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<number>(0);
  const onLoadTabRef = useCallback((index: number) => {
    tabRef.current = index;
  }, []);
  const [isGuideVisible, setGuideVisible] = useState(false);

  const historyBottomRef = useRef<HTMLDivElement | null>(null);
  const isHistoryRendered = isNotNil(historyBottomRef.current);
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
    ? formatDecimals(currentMarket.oracleValue.price, 18, 2, true)
    : '-';

  const isPositionsEmpty = isNil(positions) || positions.length === 0;
  const positionList = positions || [];

  const historyList = useMemo(() => {
    if (isNil(history)) {
      return;
    }
    return history
      .sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1))
      .slice(0, PAGE_SIZE * pages.history)
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
  }, [history, pages]);

  const tradeList = useMemo(() => {
    return trades
      ?.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1))
      .slice(0, PAGE_SIZE * pages.trades)
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
  }, [trades, pages.trades]);

  const hasMoreHistory = useMemo(() => {
    const toBlockNumber = historyData?.[historyData.length - 1].toBlockNumber;
    if (!toBlockNumber || !initialBlockNumber) {
      return true;
    }
    return toBlockNumber > initialBlockNumber;
  }, [historyData, initialBlockNumber]);
  const hasMoreTrades = useMemo(() => {
    const toBlockNumber = tradesData?.[tradesData.length - 1].toBlockNumber;
    if (!toBlockNumber || !initialBlockNumber) {
      return true;
    }
    return toBlockNumber > initialBlockNumber;
  }, [tradesData, initialBlockNumber]);

  const onLoadHistoryRef = useCallback((element: HTMLDivElement | null) => {
    historyBottomRef.current = element;
  }, []);
  const onLoadTradesRef = useCallback((element: HTMLDivElement | null) => {
    tradeBottomRef.current = element;
  }, []);
  const onRefreshList = useCallback(async () => {
    switch (tabRef.current) {
      case 0: {
        await fetchPositions();
        break;
      }
      case 1: {
        await refreshTradeHistory();
        break;
      }
      case 2: {
        await refreshTradeLogs();
        break;
      }
    }
  }, [fetchPositions, refreshTradeHistory, refreshTradeLogs]);

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
    isTradeLogsLoading,
    historyList,
    tradeList,
    hasMoreHistory,
    hasMoreTrades,
    onFetchNextTrade,
    onFetchNextHistory,
    onLoadHistoryRef,
    onLoadTradesRef,
    onLoadTabRef,
    onRefreshList,
  };
}
