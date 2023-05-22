import { useMemo, useState } from "react";
import { BigNumber } from "ethers";
import useSWR from "swr";

import { useAppSelector } from "~/store";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

import { useRouter } from "~/hooks/useRouter";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useSelectedMarket } from "~/hooks/useMarket";
import { useSelectedToken } from "~/hooks/useSettlementToken";

export const usePosition = () => {
  const [usumAccount] = useUsumAccount();
  const [selectedMarket] = useSelectedMarket();

  const fetchKey = useMemo(
    () =>
      isValid(usumAccount) && isValid(selectedMarket)
        ? ([usumAccount, selectedMarket] as const)
        : undefined,
    [usumAccount, selectedMarket]
  );

  const {
    data: positionIds,
    error,
    mutate,
  } = useSWR(fetchKey, async ([account, selectedMarket]) => {
    const positionIds = await account.getPositionIds(selectedMarket.address);

    return positionIds;
  });

  if (error) {
    errorLog(error);
  }

  return [positionIds, mutate] as const;
};

export const useOpenPosition = () => {
  const [deadline] = useState(0);

  const {
    contractQuantity,
    leverage,
    takeProfitRate,
    stopLossRate,
    // transactionFee,
  } = useAppSelector((state) => state.trade);

  const [selectedMarket] = useSelectedMarket();
  const [selectedToken] = useSelectedToken();

  const [router] = useRouter();

  const openPosition = async () => {
    if (!isValid(selectedMarket)) {
      return Promise.reject(errorLog("OpenPosition: No selected market"));
    }
    if (!isValid(selectedToken)) {
      return Promise.reject(errorLog("OpenPosition: No selected token"));
    }

    try {
      const result = await router.openPosition(
        selectedMarket.address,
        contractQuantity,
        leverage,
        takeProfitRate,
        stopLossRate,
        null!,
        deadline
      );
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(errorLog("OpenPosition:", error));
    }
  };

  return openPosition;
};

export const useClosePosition = (positionId: BigNumber) => {
  const [deadline] = useState(0);

  const [selectedMarket] = useSelectedMarket();
  const [selectedToken] = useSelectedToken();

  const [router] = useRouter();

  const closePosition = async () => {
    if (!isValid(selectedMarket)) {
      return Promise.reject(errorLog("ClosePosition: No selected market"));
    }
    if (!isValid(selectedToken)) {
      return Promise.reject(errorLog("ClosePosition: No selected token"));
    }

    try {
      const result = await router.closePosition(
        selectedMarket.address,
        positionId,
        deadline
      );
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(errorLog("ClosePosition:", error));
    }
  };

  return closePosition;
};
