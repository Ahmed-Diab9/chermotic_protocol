import { aggregatorV3InterfaceABI } from '@chromatic-protocol/sdk-viem/contracts';
import { getContract } from '@wagmi/core';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { PRICE_FEED } from '../configs/token';
import { isValid } from '../utils/valid';
import { useError } from './useError';
import { checkAllProps } from '../utils';

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = {
    name: 'getPriceFeeds',
    address: address,
  };
  const {
    data: priceFeed,
    error,
    mutate: fetchPriceFeed,
    isLoading: isFeedLoading,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : null, async ({ address }) => {
    const tokens = Object.keys(PRICE_FEED);
    const availableToken = tokens
      .filter((token) => PRICE_FEED[token])
      .map((token) => {
        return {
          name: token,
          address: PRICE_FEED[token],
        };
      });

    const result = await Promise.all(
      availableToken
        .filter((token) => token.address)
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
        })
    );

    return result.reduce((map, row) => {
      map[row.address] = {
        name: row.name,
        value: row.latestRoundData[1],
        decimals: row.decimals,
      };
      return map;
    }, {} as Record<Address, { name: string; value: bigint; decimals: number }>);
  });

  useError({ error });

  return { priceFeed, isFeedLoading, fetchPriceFeed } as const;
};

export default usePriceFeed;
