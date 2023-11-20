import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import { PAGE_SIZE } from '~/constants/arbiscan';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';

import { useLastOracle } from '~/hooks/useLastOracle';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { usePositionFilter } from '~/hooks/usePositionFilter';
import { usePositions } from '~/hooks/usePositions';
import { usePrevious } from '~/hooks/usePrevious';
import { useTradeHistory } from '~/hooks/useTradeHistory';
import { useTradeLogs } from '~/hooks/useTradeLogs';

import { TRADE_EVENT } from '~/typings/events';
import { POSITION_STATUS } from '~/typings/position';
import { formatTimestamp } from '~/utils/date';

import { abs, divPreserved, formatDecimals } from '~/utils/number';
import { wait } from '~/utils/promise';

export function useTradeManagementV3() {
  const { currentMarket, markets } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { positions, isLoading, fetchPositions } = usePositions();
  const previousPositions = usePrevious(positions, true);
  const { filterOption } = usePositionFilter();
  const filteredMarkets = useMemo(() => {
    if (isNil(currentMarket)) {
      return [];
    }
    switch (filterOption) {
      case 'ALL': {
        return entireMarkets;
      }
      case 'TOKEN_BASED': {
        return markets;
      }
      case 'MARKET_ONLY': {
        return [currentMarket];
      }
    }
  }, [entireMarkets, markets, currentMarket, filterOption]);
  const previousMarkets = usePrevious(filteredMarkets, true);
  const { history, isLoading: isHistoryLoading, refreshTradeHistory } = useTradeHistory();
  const { trades, isLoading: isTradeLogsLoading, refreshTradeLogs } = useTradeLogs();
  const { fetchBalances } = useChromaticAccount();
  const [pages, setPages] = useState({ history: 1, trades: 1 });
  const [isLoadings, setIsLoadings] = useState({ history: false, trades: false });

  useEffect(() => {
    if (isNil(filteredMarkets) || isNil(previousMarkets)) {
      return;
    }
    let hasOpenedPositions = false;
    let hasClosedPositions = false;
    for (let index = 0; index < filteredMarkets.length; index++) {
      const filteredMarket = filteredMarkets[index];

      const previousMarket = previousMarkets.find(
        (market) => market.address === filteredMarket.address
      );
      if (isNil(previousMarket)) {
        continue;
      }
      if (previousMarket.oracleValue.version !== filteredMarket.oracleValue.version) {
        const previousOpenings = (previousPositions ?? []).filter(
          (position) =>
            position.status === POSITION_STATUS.OPENING &&
            position.marketAddress === filteredMarket.address
        ).length;
        if (previousOpenings > 0) {
          hasOpenedPositions = true;
        }
        const previousClosings = (previousPositions ?? []).filter(
          (position) =>
            position.status === POSITION_STATUS.CLOSING &&
            position.marketAddress === filteredMarket.address
        ).length;
        if (previousClosings > 0) {
          hasClosedPositions = true;
        }
      }
    }
    if (hasOpenedPositions) {
      toast.info('The opening process has been completed.');
    }
    if (hasClosedPositions) {
      toast.info('The closing process has been completed.');
    }
    if (hasOpenedPositions || hasClosedPositions) {
      fetchPositions();
      fetchBalances();
    }
  }, [
    filteredMarkets,
    previousMarkets,
    previousPositions,
    positions,
    fetchBalances,
    fetchPositions,
  ]);

  const positionPnls = useMemo(() => {
    return positions?.reduce((pnls, position) => {
      const { tokenAddress, marketAddress } = position;
      const pnl = pnls[`${tokenAddress}:${marketAddress}`];
      if (isNil(pnl)) {
        pnls[`${tokenAddress}:${marketAddress}`] = position.pnl;
      } else {
        pnls[`${tokenAddress}:${marketAddress}`] += position.pnl;
      }
      return pnls;
    }, {} as Record<`${Address}:${Address}`, bigint>);
  }, [positions]);

  const historyPnls = useMemo(() => {
    history?.reduce((pnls, historyItem) => {
      const { market, token } = historyItem;
      const pnl = pnls[`${token.address}:${market.address}`];
      if (isNil(pnl)) {
        pnls[`${token.address}:${market.address}`] = historyItem.pnl;
      } else {
        pnls[`${token.address}:${market.address}`] += historyItem.pnl;
      }
      return pnls;
    }, {} as Record<`${Address}:${Address}`, bigint>);
  }, [history]);

  const onFetchNextHistory = async () => {
    setIsLoadings((loadingState) => ({
      ...loadingState,
      history: true,
    }));
    await wait(1000);
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
    await wait(1000);
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

  const hasMores = useMemo(() => {
    if (isNil(history) || isNil(trades)) {
      return {
        history: false,
        trades: false,
      };
    }
    return {
      history: history.length > pages.history * PAGE_SIZE,
      trades: trades.length > pages.trades * PAGE_SIZE,
    };
  }, [history, trades, pages]);

  const onLoadHistoryRef = useCallback((element: HTMLDivElement | null) => {
    historyBottomRef.current = element;
  }, []);
  const onLoadTradesRef = useCallback((element: HTMLDivElement | null) => {
    tradeBottomRef.current = element;
  }, []);
  const onRefreshList = useCallback(async () => {
    switch (tabRef.current) {
      case 0: {
        toast('Refreshing positions.');
        await fetchPositions();
        break;
      }
      case 1: {
        toast('Refreshing trade history.');
        await refreshTradeHistory();
        break;
      }
      case 2: {
        toast('Refreshing trade logs.');
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
    isHistoryLoading: isHistoryLoading || isLoadings.history,
    isTradeLogsLoading: isTradeLogsLoading || isLoadings.trades,
    historyList,
    tradeList,
    hasMores,
    onFetchNextTrade,
    onFetchNextHistory,
    onLoadHistoryRef,
    onLoadTradesRef,
    onLoadTabRef,
    onRefreshList,
  };
}
