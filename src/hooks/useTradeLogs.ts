import { Client } from '@chromatic-protocol/sdk-viem';
import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import axios from 'axios';
import { isNil } from 'ramda';
import useSWRInfinite from 'swr/infinite';
import { decodeEventLog, getEventSelector } from 'viem';
import { Address } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL, BLOCK_CHUNK, PAGE_SIZE } from '~/constants/arbiscan';
import { MarketLike, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { trimMarket, trimMarkets } from '~/utils/market';
import { abs, divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useInitialBlockNumber } from './useInitialBlockNumber';
import { useEntireMarkets, useMarket } from './useMarket';
import { usePositionFilter } from './usePositionFilter';
import { useSettlementToken } from './useSettlementToken';

type Trade = {
  positionId: bigint;
  token: Token;
  market: MarketLike;
  entryPrice: bigint;
  direction: 'long' | 'short';
  collateral: bigint;
  qty: bigint;
  leverage: bigint;
  entryTimestamp: bigint;
  blockNumber: bigint;
};

type GetTradeLogsParams = {
  toBlockNumber: bigint;
  initialBlockNumber: bigint;
  accountAddress: Address;
  markets: MarketLike[];
  tokens: Token[];
  client: Client;
};

const eventSignature = getEventSelector({
  name: 'OpenPosition',
  type: 'event',
  inputs: chromaticAccountABI.find((abiItem) => abiItem.name === 'OpenPosition')!.inputs,
});

const getTradeLogs = async (params: GetTradeLogsParams) => {
  const { toBlockNumber, initialBlockNumber, accountAddress, markets, tokens, client } = params;
  const fromBlockNumber: bigint =
    toBlockNumber - BLOCK_CHUNK > initialBlockNumber
      ? toBlockNumber - BLOCK_CHUNK
      : initialBlockNumber;
  const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&fromBlock=${fromBlockNumber}&toBlock=${Number(
    toBlockNumber
  )}&apikey=${ARBISCAN_API_KEY}`;
  const response = await axios(apiUrl);
  const responseData = await response.data;
  const responseLogs =
    typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);

  const decodedLogsPromise = responseLogs.map(async (log) => {
    const decoded = decodeEventLog({
      abi: chromaticAccountABI,
      data: log.data,
      topics: log.topics,
      eventName: 'OpenPosition',
    });
    const { positionId, qty, takerMargin, marketAddress, openTimestamp, openVersion } =
      decoded.args;
    const selectedMarket = markets.find((market) => market.address === marketAddress);
    const selectedToken = tokens.find((token) => token.address === selectedMarket?.tokenAddress);
    if (isNil(selectedMarket) || isNil(selectedToken)) {
      throw new Error('Invalid logs');
    }
    const oracleProvider = await client.market().contracts().oracleProvider(selectedMarket.address);
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
      blockNumber: BigInt(log.blockNumber),
    } satisfies Trade;
  });

  const decodedLogs = await PromiseOnlySuccess(decodedLogsPromise);
  return { decodedLogs, fromBlockNumber };
};

export const useTradeLogs = () => {
  const { isReady, client } = useChromaticClient();
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { filterOption } = usePositionFilter();
  const { initialBlockNumber } = useInitialBlockNumber();

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
        markets: trimMarkets(markets),
        entireMarkets: trimMarkets(entireMarkets),
        currentMarket: trimMarket(currentMarket),
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
      let tradeLogs = [] as Trade[];

      while (true) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(undefined!);
          }, 1000)
        );
        const { decodedLogs, fromBlockNumber } = await getTradeLogs({
          toBlockNumber,
          initialBlockNumber,
          accountAddress,
          markets: filteredMarkets,
          tokens,
          client,
        });
        decodedLogs.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1));
        const totalLength = tradeLogs.length + decodedLogs.length;

        if (totalLength > PAGE_SIZE) {
          tradeLogs = tradeLogs.concat(decodedLogs).slice(0, PAGE_SIZE);
          toBlockNumber = tradeLogs[tradeLogs.length - 1].blockNumber - 1n;
          break;
        } else if (totalLength === PAGE_SIZE) {
          tradeLogs = tradeLogs.concat(decodedLogs);
          toBlockNumber = fromBlockNumber - 1n;
          break;
        } else {
          tradeLogs = tradeLogs.concat(decodedLogs);
          toBlockNumber = fromBlockNumber - 1n;
          if (fromBlockNumber === initialBlockNumber) {
            break;
          }
        }
      }
      return {
        tradeLogs,
        toBlockNumber,
      };
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      shouldRetryOnError: false,
    }
  );

  const onFetchNextTrade = () => {
    setSize((size) => size + 1);
  };

  useError({ error });

  return {
    tradesData,
    isLoading,
    onFetchNextTrade,
  };
};
