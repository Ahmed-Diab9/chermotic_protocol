import useSWR from 'swr';
import { ethers, BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import { AggregatorV3Interface__factory } from '@chromatic-protocol/sdk/contracts';
import { Price } from '../typings/market';
import { errorLog } from '../utils/log';
import { isValid } from '../utils/valid';
import { PRICE_FEED } from '../configs/token';

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = isValid(address) ? ['PRICE_FEED', address] : undefined;
  const {
    data: priceFeed,
    error,
    mutate: fetchPriceFeed,
    isLoading: isFeedLoading,
  } = useSWR(fetchKey, async ([_, walletAddress]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner(walletAddress);
    const tokens = Object.keys(PRICE_FEED);
    const promise = tokens.map(async (token) => {
      const priceFeed = AggregatorV3Interface__factory.connect(PRICE_FEED[token] as string, signer);
      const { answer } = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();
      return [token, answer, decimals] as const;
    });
    const response = await Promise.allSettled(promise);
    return response
      .filter(
        (result): result is PromiseFulfilledResult<[string, BigNumber, number]> =>
          result.status === 'fulfilled'
      )
      .map(({ value }) => value)
      .reduce((acc, currentValue) => {
        const [token, value, decimals] = currentValue;
        acc[token] = { value, decimals };
        return acc;
      }, {} as Record<string, Price>);
  });

  if (error) {
    errorLog(error);
  }

  return { priceFeed, isFeedLoading, fetchPriceFeed } as const;
};

export default usePriceFeed;
