import { useEffect } from "react";
import useSWR from "swr";
import { useContract } from "wagmi";
import { useAppDispatch } from "../store";
import { marketAction } from "../store/reducer/market";

/**
 * FIXME @austin-builds
 * Required to fetch token, and market list for Header component.
 * - Contracts
 * - Methods
 * - Data structure of response objects
 */
const useMarket = (interval?: number) => {
  const contract = useContract();
  const dispatch = useAppDispatch();
  const intervalConfig =
    typeof interval === "number"
      ? {
          dedupingInterval: interval,
        }
      : null;

  const fetchMarketsMethod = "FETCH_MARKETS_METHOD";
  const fetchTokensMethod = "FETCH_TOKENS_METHOD";
  const { data: markets } = useSWR(
    [contract],
    async ([contract]) => {
      const response = await contract[fetchMarketsMethod]();

      return response;
    },
    intervalConfig
  );
  const { data: tokens } = useSWR(
    [contract],
    async ([contract]) => {
      const response = await contract[fetchTokensMethod]();

      return response;
    },
    intervalConfig
  );

  useEffect(() => {
    dispatch(marketAction.onMarketsUpdate(markets));
  }, [dispatch, markets]);

  useEffect(() => {
    dispatch(marketAction.onTokensUpdate(tokens));
  }, [dispatch, tokens]);
};

export default useMarket;
