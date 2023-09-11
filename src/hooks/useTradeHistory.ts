import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil } from 'ramda';
import useSWR from 'swr';
import { decodeEventLog } from 'viem';
import { Market, Token } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { abs, divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useEntireMarkets } from './useMarket';
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
  const { markets } = useEntireMarkets();
  const fetchKey = {
    key: 'fetchTradeHistories',
    accountAddress,
    tokens,
    markets,
  };

  const {
    data: history,
    error,
    isLoading,
  } = useSWR(
    isReady && chromaticAccountABI && checkAllProps(fetchKey) && fetchKey,
    async ({ accountAddress, tokens, markets }) => {
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
      const map = resolvedLogs.reduce((map, log) => {
        const { positionId, marketAddress } = log.args;
        const selectedMarket = markets?.find((market) => market.address === marketAddress);
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
            const { takerMargin, qty, entryOracle, positionId } = log.args;
            mapValue.collateral = takerMargin;
            mapValue.qty = qty;
            mapValue.direction = qty >= 0n ? 'long' : 'short';
            mapValue.entryPrice = entryOracle.price;
            mapValue.entryTimestamp = entryOracle.timestamp;
            mapValue.leverage = divPreserved(abs(qty), takerMargin, selectedToken.decimals);
            mapValue.isOpened = true;
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
            const { realizedPnl, interest } = log.args;
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
        logP.positionId < logQ.positionId ? 1 : -1
      );
    }
  );

  useError({ error });

  return {
    history,
    isLoading,
  };
};
