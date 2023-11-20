import { Client } from '@chromatic-protocol/sdk-viem';
import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import axios from 'axios';
import { isNil } from 'ramda';
import { useCallback } from 'react';
import useSWR from 'swr';
import { decodeEventLog, getEventSelector } from 'viem';
import { Address } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL } from '~/constants/arbiscan';
import { MarketLike, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { trimMarket, trimMarkets } from '~/utils/market';
import { abs, divPreserved } from '~/utils/number';
import { PromiseOnlySuccess, wait } from '~/utils/promise';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
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
  const { accountAddress, markets, tokens, client } = params;
  let index = 1;
  let responseLogs = [] as ResponseLog[];
  while (true) {
    const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&page=${index}&offset=1000&apikey=${ARBISCAN_API_KEY}`;
    const response = await axios(apiUrl);
    const responseData = await response.data;
    const logs =
      typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
    if (logs.length === 0) {
      break;
    }
    responseLogs = responseLogs.concat(logs);
    index += 1;
    await wait(500);
  }

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
  return { decodedLogs };
};

export const useTradeLogs = () => {
  const { isReady, client } = useChromaticClient();
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { filterOption } = usePositionFilter();

  const fetchKey = {
    key: 'fetchTradeLogs',
    accountAddress,
    tokens,
    markets: trimMarkets(markets),
    entireMarkets: trimMarkets(entireMarkets),
    currentMarket: trimMarket(currentMarket),
    filterOption,
  };

  const {
    data: trades,
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
      const { decodedLogs } = await getTradeLogs({
        accountAddress,
        markets: filteredMarkets,
        tokens,
        client,
      });
      decodedLogs.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1));
      return decodedLogs;
    },
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      shouldRetryOnError: false,
    }
  );

  const refreshTradeLogs = useCallback(() => {
    mutate();
  }, [mutate]);

  useError({ error });

  return {
    trades,
    isLoading,
    refreshTradeLogs,
  };
};
