import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { decodeEventLog, getEventSelector } from 'viem';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL, BLOCK_CHUNK, PAGE_SIZE } from '~/constants/arbiscan';
import { Market, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { abs, divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useEntireMarkets, useMarket } from './useMarket';
import { usePositionFilter } from './usePositionFilter';
import { useSettlementToken } from './useSettlementToken';

type Trade = {
  positionId: bigint;
  token: Token;
  market: Market;
  entryPrice: bigint;
  direction: 'long' | 'short';
  collateral: bigint;
  qty: bigint;
  leverage: bigint;
  entryTimestamp: bigint;
  blockNumber: bigint;
};

export const useTradeLogs = () => {
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
      const initialLog: ResponseLog[] = apiData.result;
      if (initialLog.length <= 0) {
        return undefined;
      }
      return BigInt(initialLog[0].blockNumber);
    }
  );

  const {
    data: tradesData,
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
        key: 'fetchTradeLogs',
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
      const eventSignature = getEventSelector({
        name: 'OpenPosition',
        type: 'event',
        inputs: chromaticAccountABI.find((abiItem) => abiItem.name === 'OpenPosition')!.inputs,
      });
      if (isNil(toBlockNumber)) {
        toBlockNumber = await client.publicClient?.getBlockNumber();
        if (isNil(toBlockNumber)) {
          throw new Error('Invalid block number bounds');
        }
      }
      let logs = [] as ResponseLog[];
      while (true) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(undefined!);
          }, 500)
        );
        const fromBlockNumber: bigint =
          toBlockNumber - BLOCK_CHUNK > initialBlockNumber
            ? toBlockNumber - BLOCK_CHUNK
            : initialBlockNumber;
        const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&fromBlock=${fromBlockNumber}&toBlock=${Number(
          toBlockNumber
        )}&apikey=${ARBISCAN_API_KEY}`;
        const response = await fetch(apiUrl);
        const responseData = await response.json();
        const responseLogs =
          typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
        responseLogs.sort((previous, next) => (previous.blockNumber < next.blockNumber ? 1 : -1));
        const totalLength = logs.length + responseLogs.length;
        if (totalLength > PAGE_SIZE) {
          const slicedLogs = responseLogs.slice(0, PAGE_SIZE - responseLogs.length);
          const newToBlockNumber = slicedLogs[slicedLogs.length - 1].blockNumber;
          logs = logs.concat(slicedLogs);
          toBlockNumber = BigInt(newToBlockNumber) - 1n;
          break;
        } else if (totalLength === PAGE_SIZE) {
          logs = logs.concat(responseLogs);
          toBlockNumber = fromBlockNumber - 1n;
          break;
        } else {
          logs = logs.concat(responseLogs);
          toBlockNumber = fromBlockNumber - 1n;
          if (fromBlockNumber === initialBlockNumber) {
            break;
          }
        }
      }
      const decodedLogs = logs.map((log) => {
        return {
          ...decodeEventLog({
            abi: chromaticAccountABI,
            data: log.data,
            topics: log.topics,
            eventName: 'OpenPosition',
          }).args,
          blockNumber: BigInt(log.blockNumber),
        };
      });
      const tradeLogsPromise = decodedLogs.map(async (decodedArg) => {
        const {
          positionId,
          qty,
          takerMargin,
          marketAddress,
          openTimestamp,
          openVersion,
          blockNumber,
        } = decodedArg;
        const selectedMarket = entireMarkets.find((market) => market.address === marketAddress);
        const selectedToken = tokens.find(
          (token) => token.address === selectedMarket?.tokenAddress
        );
        if (isNil(selectedMarket) || isNil(selectedToken)) {
          throw new Error('Invalid logs');
        }
        const oracleProvider = await client
          .market()
          .contracts()
          .oracleProvider(selectedMarket.address);
        const entryOracle = await oracleProvider.read.atVersion([openVersion + 1n]);
        return {
          positionId,
          token: selectedToken,
          market: selectedMarket,
          qty: abs(qty),
          collateral: takerMargin,
          leverage: divPreserved(qty, takerMargin, selectedToken.decimals),
          direction: qty > 0n ? 'long' : 'short',
          entryTimestamp: openTimestamp,
          entryPrice: entryOracle.price,
          blockNumber,
        } satisfies Trade;
      });
      const resolvedLogs = await PromiseOnlySuccess(tradeLogsPromise);
      return {
        tradeLogs: resolvedLogs,
        toBlockNumber,
      };
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const onFetchNextTrade = () => {
    setSize(size + 1);
  };

  useError({ error });

  return {
    tradesData,
    isLoading,
    onFetchNextTrade,
  };
};
