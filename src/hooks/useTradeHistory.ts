import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { decodeEventLog, getEventSelector } from 'viem';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL, BLOCK_CHUNK, PAGE_SIZE } from '~/constants/arbiscan';
import { Market, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useEntireMarkets, useMarket } from './useMarket';
import { usePositionFilter } from './usePositionFilter';
import { useSettlementToken } from './useSettlementToken';

type History = {
  positionId: bigint;
  token: Token;
  market: Market;
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

export const useTradeHistory = () => {
  const { isReady, client } = useChromaticClient();
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { filterOption } = usePositionFilter();

  const { data: initialBlockNumber } = useSWR(
    isNotNil(accountAddress) ? { accountAddress, key: 'fetchInitialLogBlockNumber' } : undefined,
    async ({ accountAddress }) => {
      const eventSignature = getEventSelector({
        name: 'OpenPosition',
        type: 'event',
        inputs: chromaticAccountABI.find((abiItem) => abiItem.name === 'OpenPosition')!.inputs,
      });
      const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&page=1&offset=1&apikey=${ARBISCAN_API_KEY}`;
      const apiResponse = await fetch(apiUrl);
      const apiData = await apiResponse.json();
      const initialLog: { blockNumber: `0x${string}` }[] = apiData.result;
      if (initialLog.length <= 0) {
        return undefined;
      }
      return BigInt(initialLog[0].blockNumber);
    }
  );

  const {
    data: historyData,
    isLoading,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousData) => {
      if (!isReady || isNil(initialBlockNumber)) {
        return null;
      }
      const fetchKey = {
        key: 'fetchHistory',
        accountAddress,
        tokens,
        markets,
        entireMarkets,
        currentMarket,
        filterOption,
        initialBlockNumber,
      };
      if (!checkAllProps(fetchKey)) {
        return;
      }
      if (previousData?.toBlockNumber < initialBlockNumber) {
        return null;
      }
      return checkAllProps(fetchKey)
        ? { ...fetchKey, toBlockNumber: previousData?.toBlockNumber as bigint | undefined }
        : null;
    },
    async ({
      accountAddress,
      tokens,
      markets,
      entireMarkets,
      currentMarket,
      filterOption,
      initialBlockNumber,
      toBlockNumber,
    }) => {
      if (isNil(toBlockNumber)) {
        toBlockNumber = await client.publicClient?.getBlockNumber();
        if (isNil(toBlockNumber)) {
          throw new Error('Invalid block number bounds');
        }
      }
      const filteredMarkets =
        filterOption === 'ALL'
          ? entireMarkets
          : filterOption === 'TOKEN_BASED'
          ? markets
          : markets.filter((market) => market.address === currentMarket?.address);
      let historyResult = [] as History[];
      while (true) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(undefined!);
          }, 1000)
        );
        const fromBlockNumber: bigint =
          toBlockNumber - BLOCK_CHUNK > initialBlockNumber
            ? toBlockNumber - BLOCK_CHUNK
            : initialBlockNumber;
        const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&fromBlock=${Number(
          fromBlockNumber
        )}&toBlock=${Number(toBlockNumber)}&apikey=${ARBISCAN_API_KEY}`;
        const response = await fetch(apiUrl);
        const responseData = await response.json();
        const responseLogs =
          typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
        const decodedLogMap = responseLogs
          .map((log) => {
            const decoded = decodeEventLog({
              abi: chromaticAccountABI,
              data: log.data,
              topics: log.topics,
            });
            return {
              ...decoded,
              blockNumber: BigInt(log.blockNumber),
            };
          })
          .reduce(
            (history, decoded) => {
              const { positionId, marketAddress } = decoded.args;
              const { eventName, blockNumber } = decoded;
              const selectedMarket = filteredMarkets.find(
                (market) => market.address === marketAddress
              );
              const selectedToken = tokens?.find(
                (token) => token.address === selectedMarket?.tokenAddress
              );
              if (isNil(selectedMarket) || isNil(selectedToken)) {
                return history;
              }
              const historyValue =
                history.get(positionId) ??
                ({
                  positionId,
                  token: selectedToken,
                  market: selectedMarket,
                  blockNumber,
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
                  history.set(positionId, historyValue as History);
                  break;
                }
              }
              return history;
            },
            historyResult.reduce((newMap, log) => {
              newMap.set(log.positionId, log);
              return newMap;
            }, new Map<bigint, History>())
          );
        const historyArray = Array.from(decodedLogMap.values());
        historyArray.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1));
        const filteredHistory = historyArray.filter((history) => history.isClaimed);
        const totalLength = filteredHistory.length;

        const slicedHistory = filteredHistory.slice(0, PAGE_SIZE);
        const hasPartialHistory =
          slicedHistory.filter((history) => !history.isClosed || !history.isOpened).length > 0;
        if (!hasPartialHistory) {
          if (totalLength > PAGE_SIZE) {
            const newToBlockNumber = slicedHistory[slicedHistory.length - 1].blockNumber;
            historyResult = slicedHistory;
            toBlockNumber = newToBlockNumber - 1n;
            break;
          } else if (totalLength === PAGE_SIZE) {
            historyResult = filteredHistory;
            toBlockNumber = fromBlockNumber - 1n;
            break;
          } else {
            historyResult = filteredHistory;
            toBlockNumber = fromBlockNumber - 1n;
            if (fromBlockNumber === initialBlockNumber) {
              break;
            }
          }
        } else {
          historyResult = filteredHistory;
          toBlockNumber = fromBlockNumber - 1n;
        }
      }
      return {
        history: historyResult,
        toBlockNumber,
      };
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const onFetchNextHistory = () => {
    setSize(size + 1);
  };

  useError({ error });

  return {
    historyData,
    isLoading,
    onFetchNextHistory,
  };
};
