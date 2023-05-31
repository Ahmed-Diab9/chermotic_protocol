import { useMemo } from "react";
import { BigNumber } from "ethers";
import useSWR from "swr";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

import { useRouter } from "~/hooks/useRouter";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useSelectedMarket } from "~/hooks/useMarket";
import { createPositionsMock } from "~/mock/positions";
import { USUMMarket__factory, getDeployedContract } from "@quarkonix/usum";
import { useProvider } from "wagmi";
import { PositionResponse } from "~/typings/position";
import useDeadline from "./useDeadline";

export const usePosition = () => {
  const [usumAccount] = useUsumAccount();
  const [market] = useSelectedMarket();
  const provider = useProvider();
  const [router] = useRouter();
  const deadline = useDeadline();

  const fetchKey = useMemo(
    () =>
      isValid(usumAccount) && isValid(market) && isValid(provider)
        ? ([usumAccount, market.address, provider] as const)
        : undefined,
    [usumAccount, market, provider]
  );

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(fetchKey, async ([account, marketAddress, provider]) => {
    const positionIds = await account.getPositionIds(marketAddress);
    const marketContract = USUMMarket__factory.connect(marketAddress, provider);

    const positions: PositionResponse[] = await marketContract.getPositions(
      positionIds
    );
    return positions;
  });

  const onClosePosition = async (positionId: BigNumber) => {
    if (!isValid(market)) {
      errorLog("No selected markets");
      return Promise.reject("onClosePosition ::: no selected markets");
    }

    try {
      const result = await router?.closePosition(
        market.address,
        positionId,
        deadline
      );
      return Promise.resolve(result);
    } catch (error) {
      errorLog(error);

      return Promise.reject(`onClosePosition ::: ${error}`);
    }
  };

  if (error) {
    errorLog(error);
  }

  return [positions, fetchPositions, onClosePosition] as const;
};

export const usePositionsMock = () => {
  const [account] = useUsumAccount();

  const fetchKey = useMemo(() => {
    if (isValid(account)) {
      return [account] as const;
    }
  }, [account]);

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(fetchKey, ([]) => {
    return createPositionsMock();
  });

  if (error) {
    errorLog(error);
  }

  return [positions, fetchPositions] as const;
};
