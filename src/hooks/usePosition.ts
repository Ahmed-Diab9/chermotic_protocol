import useSWR from "swr";
import { useSigner } from "wagmi";
import { useMemo, useState } from "react";
import { useAppSelector } from "../store";
import { BigNumber } from "ethers";
import {
  Account__factory,
  USUMRouter__factory,
  deployed,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import useUsumAccount from "./useUsumAccount";
import { useSelectedMarket } from "./useMarket";
import { isValid } from "../utils/valid";

export const usePosition = () => {
  const { data: signer } = useSigner();
  const [account] = useUsumAccount();
  const [selectedMarket] = useSelectedMarket();
  const factory = useMemo(() => {
    if (!isValid(signer) || !isValid(account)) {
      return;
    }
    return Account__factory.connect(account, signer);
  }, [account, signer]);
  const fetchKey =
    isValid(factory) && isValid(selectedMarket)
      ? ([factory, selectedMarket] as const)
      : undefined;
  const {
    data: positionIds,
    error,
    mutate: fetchPositionIds,
  } = useSWR(fetchKey, async ([factory, selectedMarket]) => {
    const positionIds = await factory.getPositionIds(selectedMarket.address);

    return positionIds;
  });

  if (error) {
    errorLog(error);
  }

  return [positionIds, fetchPositionIds] as const;
};

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
