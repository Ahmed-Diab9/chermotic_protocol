import { watchContractEvent } from '@wagmi/core';
import { isNil, isNotNil } from 'ramda';
import { useEffect } from 'react';
import useSWR from 'swr';
import { parseAbiItem } from 'viem';
import { Market } from '~/typings/market';
import { promiseIfFulfilled } from '~/utils/promise';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';

const aggregatorAbi = parseAbiItem('function aggregator() external view returns (address)');
const answerUpdatedAbi = parseAbiItem(
  'event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt)'
);

interface UseOracleListener<M extends Market[] | Market> {
  market?: M extends Market ? Market : undefined;
  markets?: M extends Market[] ? Market[] : undefined;
  onUpdate?: (market: Market) => unknown;
}

const useOracleListener = <M extends Market[] | Market>(props: UseOracleListener<M>) => {
  const { market, markets, onUpdate } = props;
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    key: 'useOracleListener',
    market,
    markets,
  };
  const {
    data: response,
    error,
    isLoading,
  } = useSWR(
    isReady ? fetchKey : undefined,
    async ({ market, markets }) => {
      if (isNotNil(market)) {
        const providerAddress = await client.market().oracleProvider(market.address);
        const aggregator = await client.publicClient?.readContract({
          abi: [aggregatorAbi],
          address: providerAddress,
          functionName: 'aggregator',
        });
        if (isNil(aggregator)) {
          return;
        }
        const chainlinkAddress = await client.publicClient?.readContract({
          abi: [aggregatorAbi],
          address: aggregator,
          functionName: 'aggregator',
        });
        return chainlinkAddress;
      } else if (isNotNil(markets)) {
        const providerAddresses = await promiseIfFulfilled(
          markets.map(async (market) => {
            const providerAddress = await client.market().oracleProvider(market.address);
            return providerAddress;
          })
        );
        const aggregators = await promiseIfFulfilled(
          providerAddresses.map((address) => {
            if (isNil(address)) {
              return undefined;
            }
            return client.publicClient?.readContract({
              abi: [aggregatorAbi],
              address,
              functionName: 'aggregator',
            });
          })
        );
        const chainlinkAddresses = await promiseIfFulfilled(
          aggregators.map((address) => {
            if (isNil(address)) {
              return undefined;
            }
            return client.publicClient?.readContract({
              abi: [aggregatorAbi],
              address,
              functionName: 'aggregator',
            });
          })
        );
        return chainlinkAddresses;
      }
    },
    {
      refreshInterval: 0,
    }
  );

  useError({ error });
  useEffect(() => {
    if (isNil(market) && isNil(markets)) {
      return;
    }
    if (isNil(onUpdate)) {
      return;
    }
    if (isNil(response)) {
      return;
    }
    if (response instanceof Array && isNotNil(markets)) {
      const chainlinkAddresses = response;
      const unwatches = chainlinkAddresses.map((chainlinkAddress, index) => {
        const unwatch = watchContractEvent(
          {
            abi: [answerUpdatedAbi],
            address: chainlinkAddress,
            eventName: 'AnswerUpdated',
          },
          (logs) => {
            onUpdate?.(markets[index]);
          }
        );
        return unwatch;
      });

      return () => {
        unwatches.forEach((unwatch) => unwatch());
      };
    } else if (!(response instanceof Array) && isNotNil(market)) {
      const chainlinkAddress = response;
      const unwatch = watchContractEvent(
        {
          abi: [answerUpdatedAbi],
          address: chainlinkAddress,
          eventName: 'AnswerUpdated',
        },
        (logs) => {
          onUpdate?.(market);
        }
      );

      return () => {
        unwatch();
      };
    }
  }, [market, markets, onUpdate, response]);
};

export default useOracleListener;
