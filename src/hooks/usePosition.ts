import useSWR from "swr";
import { useAccount, useContract, useNetwork } from "wagmi";
import { Position } from "../typings/position";
import { useMemo } from "react";
import { useAppSelector } from "../store";

/**
 * FIXME @austin-builds
 * contract methods are needed
 */
const usePosition = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const contract = useContract();
  const trade = useAppSelector((state) => state.trade);
  const method = "POSITIONS";

  const fetchKey = useMemo(() => {
    if (typeof address !== "string") {
      return;
    }
    if (typeof chain === "undefined" || chain.unsupported) {
      return;
    }
    if (typeof contract === "undefined") {
      return;
    }
    return [address, chain, contract, method] as const;
  }, [address, chain, contract, method]);

  const { data, isLoading, error } = useSWR(
    fetchKey,
    async ([address, chain, contract, method]) => {
      const response: unknown = await contract[method]();

      return response as Position[];
    }
  );

  return {
    isLoading,
    positions: data ?? [],
  };
};

export default usePosition;
