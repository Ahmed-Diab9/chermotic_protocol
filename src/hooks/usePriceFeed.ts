import { aggregatorV3InterfaceABI } from '@chromatic-protocol/sdk-viem/contracts';
import { getContract } from '@wagmi/core';
import { isNotNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { CHAIN } from '~/constants';
import { checkAllProps } from '~/utils';
import { PromiseOnlySuccess } from '~/utils/promise';
import { PRICE_FEEDS } from '../configs/token';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';

const getChainlinkPriceFeed = async (tokens: { name: string; address?: Address }[]) => {
  const priceResponse = tokens
    .filter((token) => isNotNil(token.address))
    .map(async (token) => {
      const contract = getContract({
        address: token.address!,
        abi: aggregatorV3InterfaceABI,
      });
      return {
        address: token.address!,
        name: token.name,
        latestRoundData: await contract.read.latestRoundData(),
        decimals: await contract.read.decimals(),
      };
    });

  const priceData = await PromiseOnlySuccess(priceResponse);
  return priceData.reduce((feed, row) => {
    feed[row.address] = {
      name: row.name,
      value: row.latestRoundData[1],
      decimals: row.decimals,
    };
    return feed;
  }, {} as Record<Address, { name: string; value: bigint; decimals: number }>);
};

const usePriceFeed = () => {
  const { isReady } = useChromaticClient();

  const fetchKey = {
    name: 'getPriceFeeds',
    feedAddresses: PRICE_FEEDS[CHAIN],
  };
  const {
    data: priceFeed,
    error,
    mutate: fetchPriceFeed,
    isLoading: isFeedLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ feedAddresses }) => {
    const tokens = Object.keys(feedAddresses);
    const availableTokens = tokens
      .filter((token) => feedAddresses[token])
      .map((token) => {
        return {
          name: token,
          address: feedAddresses[token],
        };
      });

    return getChainlinkPriceFeed(availableTokens);
  });

  useError({ error });

  return { priceFeed, isFeedLoading, fetchPriceFeed } as const;
};

export default usePriceFeed;
