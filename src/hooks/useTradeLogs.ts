import { Client } from '@chromatic-protocol/sdk-viem';
import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil } from 'ramda';
import { useCallback } from 'react';
import useSWR from 'swr';
import { decodeEventLog, getEventSelector } from 'viem';
import { Address } from 'wagmi';
import { arbiscanClient } from '~/apis/arbiscan';
import { ARBISCAN_API_KEY } from '~/constants/arbiscan';
import { Market, Token } from '~/typings/market';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { abs, divPreserved } from '~/utils/number';
import { PromiseOnlySuccess, promiseIfFulfilled, wait } from '~/utils/promise';
import useFilteredMarkets from './commons/useFilteredMarkets';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

type Trade = {
  positionId: bigint;
  token: Token;
  market: Market;
  entryPrice: bigint | undefined;
  direction: 'long' | 'short';
  collateral: bigint;
  qty: bigint;
  leverage: bigint;
  entryTimestamp: bigint;
  blockNumber: bigint;
};

type GetTradeLogsParams = {
  accountAddress: Address;
  markets: Market[];
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
  const marketApi = client.market();
  while (true) {
    const apiUrl = `/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&page=${index}&offset=1000&apikey=${ARBISCAN_API_KEY}`;
    const response = await arbiscanClient(apiUrl);
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
  const decodedLogs = responseLogs.map((log) => ({
    ...decodeEventLog({
      abi: chromaticAccountABI,
      data: log.data,
      topics: log.topics,
      eventName: 'OpenPosition',
    }),
    blockNumber: log.blockNumber,
  }));

  const oracleProviders = await PromiseOnlySuccess(
    markets.map(async (market) => {
      const oracleProvider = await marketApi.contracts().oracleProvider(market.address);
      return [market.address, oracleProvider] as const;
    })
  );
  const openOracles = await promiseIfFulfilled(
    decodedLogs.map((log) => {
      const oracleProvider = oracleProviders.find(
        ([marketAddress]) => marketAddress === log.args.marketAddress
      )?.[1];

      return oracleProvider?.read.atVersion([log.args.openVersion + 1n]);
    })
  );

  const detailedLogsPromise = decodedLogs.map(async (log, logIndex) => {
    const { positionId, qty, takerMargin, marketAddress, openTimestamp, openVersion } = log.args;
    const selectedMarket = markets.find((market) => market.address === marketAddress);
    const selectedToken = tokens.find((token) => token.address === selectedMarket?.tokenAddress);
    if (isNil(selectedMarket) || isNil(selectedToken)) {
      throw new Error('Invalid logs');
    }
    const entryOracle = openOracles[logIndex];
    return {
      positionId,
      token: selectedToken,
      market: selectedMarket,
      qty: abs(qty),
      collateral: takerMargin,
      leverage: divPreserved(qty, takerMargin, selectedToken.decimals),
      direction: qty > 0n ? 'long' : 'short',
      entryTimestamp: openTimestamp,
      entryPrice: entryOracle?.price,
      blockNumber: BigInt(log.blockNumber),
    } satisfies Trade;
  });

  const detailedLogs = await PromiseOnlySuccess(detailedLogsPromise);
  return { detailedLogs };
};

export const useTradeLogs = () => {
  const { isReady, client } = useChromaticClient();
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useFilteredMarkets();

  const fetchKey = {
    key: 'fetchTradeLogs',
    accountAddress,
    tokens,
    markets,
  };

  const {
    data: trades,
    isLoading,
    error,
    mutate,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ accountAddress, tokens, markets }) => {
      const { detailedLogs } = await getTradeLogs({
        accountAddress,
        markets,
        tokens,
        client,
      });
      detailedLogs.sort((previous, next) => (previous.positionId < next.positionId ? 1 : -1));
      return detailedLogs;
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
