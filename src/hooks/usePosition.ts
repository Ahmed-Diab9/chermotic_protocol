import { useMemo } from "react";
import { BigNumber } from "ethers";
import useSWR from "swr";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

import { useRouter } from "~/hooks/useRouter";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useMarket } from "~/hooks/useMarket";
import { createPositionsMock } from "~/mock/positions";
import { USUMMarket__factory } from "@quarkonix/usum";
import { useProvider } from "wagmi";
import { PositionResponse } from "~/typings/position";
import { filterIfFulfilled } from "~/utils/array";
import useOracleVersion from "./useOracleVersion";
import { AppError } from "~/typings/error";

export const usePosition = () => {
  const [usumAccount] = useUsumAccount();
  const [markets] = useMarket();
  const provider = useProvider();
  const [router] = useRouter();
  const [marketAddress, oracleVersion] = useOracleVersion();

  const fetchKey = useMemo(
    () =>
      isValid(usumAccount) && isValid(markets) && isValid(provider)
        ? ([
            usumAccount,
            markets.map((market) => market.address),
            provider,
          ] as const)
        : undefined,
    [usumAccount, markets, provider]
  );

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(fetchKey, async ([account, markets, provider]) => {
    const positionsPromise = markets.map(async (marketAddress) => {
      const positionIds = await account.getPositionIds(marketAddress);
      const marketContract = USUMMarket__factory.connect(
        marketAddress,
        provider
      );

      const positionResponses: PositionResponse[] =
        await marketContract.getPositions(positionIds);
      const positions = positionResponses.map((response) => ({
        marketAddress: marketAddress,
        ...response,
      }));
      return positions;
    });
    const positions = await filterIfFulfilled(positionsPromise);
    return positions.flat(1);
  });

  const closedPositions = useMemo(() => {
    if (!isValid(positions)) {
      return [];
    }
    positions.filter((position) => {
      const isMarketEqual = marketAddress === position.marketAddress;
      const hasOlderVersion = oracleVersion?.gt(position.closeVersion);
      return isMarketEqual && hasOlderVersion;
    });
  }, [positions, marketAddress, oracleVersion]);

  const onClosePosition = async (
    marketAddress: string,
    positionId: BigNumber
  ) => {
    const position = positions?.find(
      (position) =>
        position.marketAddress === marketAddress && position.id === positionId
    );
    if (!isValid(position)) {
      errorLog("no positions");
      return AppError.reject("no positions", "onClosePosition");
    }
    try {
      const result = await router?.closePosition(
        position.marketAddress,
        position.id
      );
      return Promise.resolve(result);
    } catch (error) {
      errorLog(error);

      return AppError.reject(error, "onClosePosition");
    }
  };

  const onClaimPosition = async (
    marketAddress: string,
    positionId: BigNumber
  ) => {
    const position = positions?.find(
      (position) =>
        position.marketAddress === marketAddress && position.id === positionId
    );
    if (!isValid(position)) {
      errorLog("no positions");
      return AppError.reject("no positions", "onClosePosition");
    }
    if (oracleVersion?.lte(position.closeVersion)) {
      errorLog("the selected position is not closed");

      return AppError.reject(
        "the selected position is not closed",
        "onClaimPosition"
      );
    }

    await router?.claimPosition(position.marketAddress, position.id);
  };

  if (error) {
    errorLog(error);
  }

  return {
    positions,
    closedPositions,
    fetchPositions,
    onClosePosition,
    onClaimPosition,
  };
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
