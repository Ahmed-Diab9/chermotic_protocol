import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import axios from 'axios';
import { isNil, isNotNil } from 'ramda';
import { useCallback } from 'react';
import useSWR from 'swr';
import { decodeEventLog } from 'viem';
import { Address } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL } from '~/constants/arbiscan';
import { MarketLike, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { trimMarket, trimMarkets } from '~/utils/market';
import { divPreserved } from '~/utils/number';
import { useChromaticAccount } from './useChromaticAccount';
import { useError } from './useError';
import { useEntireMarkets, useMarket } from './useMarket';
import { usePositionFilter } from './usePositionFilter';
import { useSettlementToken } from './useSettlementToken';

type History = {
  positionId: bigint;
  token: Token;
  market: MarketLike;
  entryPrice: bigint;
  direction: 'long' | 'short';
  collateral: bigint;
  qty: bigint;
  leverage: bigint;
  interest: bigint;
  pnl: bigint;
  entryTimestamp: bigint;
  closeTimestamp: bigint;
  isOpened: boolean;
  isClosed: boolean;
  isClaimed: boolean;
  blockNumber: bigint;
};

type GetTradeHistoryParams = {
  accountAddress: Address;
  markets: MarketLike[];
  tokens: Token[];
};

const getTradeHistory = async (params: GetTradeHistoryParams) => {
  const { accountAddress, markets, tokens } = params;
  let index = 1;
  let responseLogs = [] as ResponseLog[];
  while (true) {
    const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&page=${index}&offset=1000&apikey=${ARBISCAN_API_KEY}`;
    const response = await axios(apiUrl);
    const responseData = await response.data;
    const logs =
      typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
    if (logs.length === 0) {
      break;
    }
    responseLogs = responseLogs.concat(logs);
  }
  const decodedLogs = responseLogs.map((log) => {
    const decoded = decodeEventLog({
      abi: chromaticAccountABI,
      data: log.data,
      topics: log.topics,
    });
    return {
      ...decoded,
      blockNumber: BigInt(log.blockNumber),
    };
  });
  const historyMap = decodedLogs.reduce((history, decoded) => {
    const { positionId, marketAddress } = decoded.args;
    const { eventName, blockNumber } = decoded;
    const selectedMarket = markets.find((market) => market.address === marketAddress);
    const selectedToken = tokens?.find((token) => token.address === selectedMarket?.tokenAddress);
    if (isNil(selectedMarket) || isNil(selectedToken)) {
      return history;
    }
    const historyValue =
      history.get(positionId) ??
      ({
        positionId,
        token: selectedToken,
        market: selectedMarket,
        isOpened: false,
        isClosed: false,
        isClaimed: false,
      } as History);
    switch (eventName) {
      case 'OpenPosition': {
        const { takerMargin, qty, openTimestamp } = decoded.args;
        historyValue.collateral = takerMargin;
        historyValue.qty = qty;
        historyValue.direction = qty >= 0n ? 'long' : 'short';
        historyValue.entryTimestamp = openTimestamp;
        historyValue.leverage = divPreserved(qty, takerMargin, selectedToken.decimals);
        historyValue.isOpened = true;
        history.set(positionId, historyValue as History);
        break;
      }
      case 'ClosePosition': {
        const { closeTimestamp, positionId } = decoded.args;
        historyValue.closeTimestamp = closeTimestamp;
        historyValue.isClosed = true;
        history.set(positionId, historyValue as History);
        break;
      }
      case 'ClaimPosition': {
        const { realizedPnl, interest, entryPrice } = decoded.args;
        historyValue.entryPrice = entryPrice;
        historyValue.interest = interest;
        historyValue.pnl = realizedPnl;
        historyValue.isClaimed = true;
        historyValue.blockNumber = blockNumber;
        history.set(positionId, historyValue as History);
        break;
      }
    }
    return history;
  }, new Map<bigint, History>());
  const historyArray = Array.from(historyMap.values());
  return { historyArray };
};

export const useTradeHistory = () => {
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { filterOption } = usePositionFilter();

  const fetchKey = {
    key: 'fetchHistory',
    accountAddress,
    tokens,
    markets: trimMarkets(markets),
    entireMarkets: trimMarkets(entireMarkets),
    currentMarket: trimMarket(currentMarket),
    filterOption,
  };

  const {
    data: history,
    isLoading,
    error,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ accountAddress, tokens, markets, entireMarkets, currentMarket, filterOption }) => {
      const filteredMarkets =
        filterOption === 'ALL'
          ? entireMarkets
          : filterOption === 'TOKEN_BASED'
          ? markets
          : markets.filter((market) => market.address === currentMarket?.address);
      const { historyArray } = await getTradeHistory({
        accountAddress,
        markets: filteredMarkets,
        tokens,
      });
      historyArray.sort((previous, next) => {
        if (isNil(previous.blockNumber) && isNil(next.blockNumber)) {
          return 0;
        }
        if (isNil(previous.blockNumber) && isNotNil(next.blockNumber)) {
          return 1;
        }
        if (isNil(previous.blockNumber) && isNil(next.blockNumber)) {
          return -1;
        }
        return previous.blockNumber < next.blockNumber ? 1 : -1;
      });
      return historyArray;
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      shouldRetryOnError: false,
    }
  );

  const refreshTradeHistory = useCallback(() => {
    mutate();
  }, [mutate]);

  useError({ error });

  return {
    history,
    isLoading,
    refreshTradeHistory,
  };
};
