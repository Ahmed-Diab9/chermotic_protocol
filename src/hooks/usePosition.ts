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

export const useOpenPosition = () => {
  const { data: signer } = useSigner();
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const [deadline, setDeadline] = useState(0);
  const {
    contractQuantity,
    leverage,
    takeProfitRate,
    stopLossRate,
    transactionFee,
  } = useAppSelector((state) => state.trade);
  const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const openPosition = () => {
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    if (!isValid(selectedMarket)) {
      errorLog("no selected markets");
      return;
    }
    if (!isValid(selectedToken)) {
      errorLog("no selected tokens");
      return;
    }
    const router = USUMRouter__factory.connect(
      deployed["anvil"]["USUMRouter"],
      signer
    );
    router.openPosition(
      selectedMarket.address,
      contractQuantity,
      leverage,
      takeProfitRate,
      stopLossRate,
      null!,
      deadline
    );
  };

  return openPosition;
};

export const useClosePosition = (positionId: BigNumber) => {
  const { data: signer } = useSigner();
  const [deadline, setDeadline] = useState(0);
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const closePosition = () => {
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    if (!isValid(selectedMarket)) {
      errorLog("no selected markets");
      return;
    }
    if (!isValid(selectedToken)) {
      errorLog("no selected tokens");
      return;
    }
    const router = USUMRouter__factory.connect(
      deployed["anvil"]["USUMRouter"],
      signer
    );
    router.closePosition(selectedMarket.address, positionId, deadline);
  };

  return closePosition;
};
