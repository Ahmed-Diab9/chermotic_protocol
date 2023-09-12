import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import { decodeEventLog } from 'viem';
import { Market, Token } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
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
};

export const useTradeHistory = () => {
  const { isReady, client } = useChromaticClient();
  const { accountAddress } = useChromaticAccount();
  const { tokens } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { markets: entireMarkets } = useEntireMarkets();
  const { filterOption } = usePositionFilter();
  const fetchKey = {
    key: 'fetchTradeHistories',
    accountAddress,
    tokens,
    markets,
    entireMarkets,
    currentMarket,
    filterOption,
  };

  const {
    data: history,
    error,
    isLoading,
  } = useSWR(
    isReady && chromaticAccountABI && checkAllProps(fetchKey) && fetchKey,
    async ({ accountAddress, tokens, markets, entireMarkets, currentMarket, filterOption }) => {
      const filteredMarkets =
        filterOption === 'ALL'
          ? entireMarkets
          : filterOption === 'TOKEN_BASED'
          ? markets
          : markets.filter((market) => market.address === currentMarket?.address);
      const logs = await client.publicClient?.getLogs({
        address: accountAddress,
        fromBlock: 0n,
      });
      const decoded = (logs ?? [])
        .map((log) => {
          return decodeEventLog({ abi: chromaticAccountABI, data: log.data, topics: log.topics });
        })
        .map(async (log) => {
          if (log.eventName === 'OpenPosition') {
            const {
              args: { openVersion, marketAddress },
            } = log;
            const oracleProvider = await client.market().contracts().oracleProvider(marketAddress);
            const entryOracle = await oracleProvider.read.atVersion([openVersion]);
            return {
              eventName: log.eventName,
              args: {
                ...log.args,
                entryOracle,
              },
            };
          } else {
            return log;
          }
        });
      const resolvedLogs = await PromiseOnlySuccess(decoded);
      const claimedMap = resolvedLogs
        .map((log) => (log.eventName === 'ClaimPosition' ? log.args.positionId : undefined))
        .reduce((positionMap, positionId) => {
          if (isNotNil(positionId)) {
            positionMap.set(positionId, true);
          }
          return positionMap;
        }, new Map<bigint, boolean>());
      const map = resolvedLogs.reduce((map, log) => {
        const { positionId, marketAddress } = log.args;
        const selectedMarket = filteredMarkets.find((market) => market.address === marketAddress);
        const selectedToken = tokens?.find(
          (token) => token.address === selectedMarket?.tokenAddress
        );
        if (isNil(selectedMarket) || isNil(selectedToken)) {
          return map;
        }
        const mapValue: Partial<History> = map.get(positionId) ?? {
          positionId,
          token: selectedToken,
          market: selectedMarket,
          isOpened: false,
          isClosed: false,
          isClaimed: false,
        };
        switch (log.eventName) {
          case 'OpenPosition': {
            const { takerMargin, qty, positionId, openTimestamp, entryOracle } = log.args;
            mapValue.collateral = takerMargin;
            mapValue.qty = qty;
            mapValue.direction = qty >= 0n ? 'long' : 'short';
            mapValue.entryTimestamp = openTimestamp;
            mapValue.leverage = divPreserved(qty, takerMargin, selectedToken.decimals);
            mapValue.isOpened = true;
            if (!claimedMap.get(positionId)) {
              mapValue.entryPrice = entryOracle.price;
            }
            map.set(positionId, mapValue as History);
            return map;
          }
          case 'ClosePosition': {
            const { closeTimestamp } = log.args;
            mapValue.closeTimestamp = closeTimestamp;
            mapValue.isClosed = true;
            map.set(positionId, mapValue as History);
            return map;
          }
          case 'ClaimPosition': {
            const { realizedPnl, interest, entryPrice } = log.args;
            mapValue.entryPrice = entryPrice;
            mapValue.interest = interest;
            mapValue.pnl = realizedPnl;
            mapValue.isClaimed = true;
            map.set(positionId, mapValue as History);
            return map;
          }
          default: {
            return map;
          }
        }
      }, new Map<bigint, History>());

      return Array.from(map.values()).sort((logP, logQ) =>
        logP.entryTimestamp < logQ.entryTimestamp ? 1 : -1
      );
    }
  );

  useError({ error });

  return {
    history,
    isLoading,
  };
};