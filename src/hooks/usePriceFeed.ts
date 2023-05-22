import useSWR from "swr";
import { useAccount } from "wagmi";
import { isValid } from "../utils/valid";
import { PRICE_FEED } from "../configs/token";
import { AggregatorV3Interface__factory } from "@quarkonix/usum";
import { Price } from "../typings/market";
import { errorLog } from "../utils/log";
import { BigNumber, ethers } from "ethers";

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = isValid(address) ? [address] : undefined;
  const {
    data: feed,
    error,
    mutate: fetchFeed,
  } = useSWR(fetchKey, async ([walletAddress]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner(walletAddress);
    const tokens = Object.keys(PRICE_FEED);
    const promise = tokens.map(async (token) => {
      const priceFeed = AggregatorV3Interface__factory.connect(
        PRICE_FEED[token] as string,
        signer
      );
      const { answer } = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();
      return [token, answer, decimals] as const;
    });
    const response = await Promise.allSettled(promise);
    return response
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<[string, BigNumber, number]> =>
          result.status === "fulfilled"
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

  return [feed ?? {}, fetchFeed] as const;
};

export default usePriceFeed;
