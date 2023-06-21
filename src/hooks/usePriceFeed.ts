import useSWR from "swr";
import { useAccount } from "wagmi";
import { useAppSelector } from "../store";
import { Price } from "../typings/market";
import { errorLog } from "../utils/log";
import { isValid } from "../utils/valid";
import { useChromaticClient } from "./useChromaticClient";
import { useSettlementToken } from "./useSettlementToken";

const usePriceFeed = () => {
  const { address } = useAccount();
  const fetchKey = isValid(address) ? [address] : undefined;
  const { client } = useChromaticClient();
  // const { tokens } = useSettlementToken();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const {
    data: feed,
    error,
    mutate: fetchFeed,
  } = useSWR(fetchKey, async ([walletAddress]) => {
    if (client && market ) {
      // const tokenAddresses = tokens?.map((token) => token.address);
      // console.log("[usePriceFeed] ", tokenAddresses);
      // if (tokenAddresses) {
        // const response = await client.market().getCurrentPrices(tokenAddresses);
        // response.reduce((record, currentResponse) => {
        //   record[currentResponse.market] = {
        //     value: currentResponse.price.price,
        //     decimals: 0,
        //   };
        //   return record;
        // }, {} as Record<string, Price>);
      }
    }

    // const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    // const signer = provider.getSigner(walletAddress);
    // const tokens = Object.keys(PRICE_FEED);
    // const promise = tokens.map(async (token) => {
    //   const priceFeed = AggregatorV3Interface__factory.connect(
    //     PRICE_FEED[token] as string,
    //     signer
    //   );
    //   const { answer } = await priceFeed.latestRoundData();
    //   const decimals = await priceFeed.decimals();
    //   return [token, answer, decimals] as const;
    // });
    // const response = await Promise.allSettled(promise);
    // return response
    //   .filter(
    //     (
    //       result
    //     ): result is PromiseFulfilledResult<[string, BigNumber, number]> =>
    //       result.status === "fulfilled"
    //   )
    //   .map(({ value }) => value)
    //   .reduce((acc, currentValue) => {
    //     const [token, value, decimals] = currentValue;
    //     acc[token] = { value, decimals };
    //     return acc;
    //   }, {} as Record<string, Price>);
  );

  if (error) {
    errorLog(error);
  }

  return [feed, fetchFeed] as const;
};

export default usePriceFeed;
