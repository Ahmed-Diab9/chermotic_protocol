import useSWR from 'swr';
import { Address, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { PRICE_FEED } from '../configs/token';
import { Price } from '../typings/market';
import { errorLog } from '../utils/log';
import { PromiseOnlySuccess } from '../utils/promise';
import { isValid } from '../utils/valid';
import { aggregatorV3InterfaceABI } from '@chromatic-protocol/sdk-viem/contracts';
import { ADDRESS_ZERO } from '../utils/address';

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = isValid(address) ? ['PRICE_FEED', address] : undefined;
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const {
    data: priceFeed,
    error,
    mutate: fetchPriceFeed,
    isLoading: isFeedLoading,
  } = useSWR(fetchKey, async ([_, walletAddress]) => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    // const signer = provider.getSigner(walletAddress);
    const tokens = Object.keys(PRICE_FEED);
    const promise = tokens.map(async (token) => {
      // const priceFeed = AggregatorV3Interface__factory.connect(PRICE_FEED[token] as string, signer);
      // const { answer } = await priceFeed.latestRoundData();
      // const decimals = await priceFeed.decimals();
      // return [token, answer, decimals] as const;
    });
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
        ];
      })
      .flat();
    const multiCallResult = await publicClient.multicall({ contracts: contractsParam });
    const tokenMap: Record<Address, { value: bigint; decimals: bigint }> = {};
    let tokenIndex = 0;
    while (multiCallResult.length > 0) {
      const latestRoundData = multiCallResult.shift();
      const decimals = multiCallResult.shift();
      tokenMap[availableToken[tokenIndex] as Address] = {
        value: latestRoundData?.result?.answer,
        decimals: decimals?.result,
      };
      tokenIndex++;
    }
    const response = await PromiseOnlySuccess(promise);
    return response.reduce((acc, currentValue) => {
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
