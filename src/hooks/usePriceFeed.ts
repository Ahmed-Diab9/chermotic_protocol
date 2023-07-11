import useSWR from 'swr';
import { Address, useAccount, usePublicClient } from 'wagmi';
import { PRICE_FEED } from '../configs/token';
import { errorLog } from '../utils/log';
import { isValid } from '../utils/valid';
import { aggregatorV3InterfaceABI } from '@chromatic-protocol/sdk-viem/contracts';

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = isValid(address) ? ['PRICE_FEED', address] : undefined;
  const publicClient = usePublicClient();
  const {
    data: priceFeed,
    error,
    mutate: fetchPriceFeed,
    isLoading: isFeedLoading,
  } = useSWR(fetchKey, async ([_, walletAddress]) => {
    const tokens = Object.keys(PRICE_FEED);
    const availableToken = tokens.filter((token) => PRICE_FEED[token]);
    const contractsParam = availableToken
      .map((token) => {
        return [
          {
            abi: aggregatorV3InterfaceABI,
            address: PRICE_FEED[token]!,
            functionName: 'latestRoundData',
          },
          {
            abi: aggregatorV3InterfaceABI,
            address: PRICE_FEED[token]!,
            functionName: 'decimals',
          },
        ] as const;
      })
      .flat();
    const multiCallResult = await publicClient.multicall({ contracts: contractsParam });
    const tokenMap: Record<Address, { value: bigint; decimals: number }> = {};
    let tokenIndex = 0;
    while (multiCallResult.length > 0) {
      const latestRoundData = multiCallResult.shift();
      const decimals = multiCallResult.shift();
      tokenMap[availableToken[tokenIndex] as Address] = {
        value: (latestRoundData?.result as unknown as bigint[])[1],
        decimals: decimals?.result as number,
      };
      tokenIndex++;
    }
    return tokenMap;
  });

  if (error) {
    errorLog(error);
  }

  return { priceFeed, isFeedLoading, fetchPriceFeed } as const;
};

export default usePriceFeed;
