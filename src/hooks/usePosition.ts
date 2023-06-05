import { BigNumber } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

import {
  ChromaticMarket__factory,
  OracleProvider__factory,
} from "@chromatic-protocol/sdk";
import { useProvider } from "wagmi";
import { useMarket } from "~/hooks/useMarket";
import { useRouter } from "~/hooks/useRouter";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { createPositionsMock } from "~/mock/positions";
import { AppError } from "~/typings/error";
import { PositionStructOutput } from "~/typings/position";
import { filterIfFulfilled } from "~/utils/array";
import useOracleVersion from "./useOracleVersion";

export const usePosition = () => {
  const [usumAccount] = useUsumAccount();
  const [markets] = useMarket();
  const provider = useProvider();
  const [router] = useRouter();
  const { oracleVersions } = useOracleVersion();

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
      const marketContract = ChromaticMarket__factory.connect(
        marketAddress,
        provider
      );
      const oracleProviderAddress = await marketContract.oracleProvider();
      const marketOracleProvider = OracleProvider__factory.connect(
        oracleProviderAddress,
        provider
      );

      const positionResponses: PositionStructOutput[] =
        await marketContract.getPositions(positionIds);
      const positionsPromise = positionResponses.map(async (response) => {
        const [openPrice, closePrice] = await marketOracleProvider.atVersions([
          response.openVersion,
          response.closeVersion,
        ]);
        return {
          marketAddress: marketAddress,
          openPrice,
          closePrice,
          ...response,
        };
      });
      const positions = await filterIfFulfilled(positionsPromise);
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
      return !position.closeVersion.eq(0);
    });
  }, [positions]);

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
    if (oracleVersions?.[marketAddress]?.version.lte(position.closeVersion)) {
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
