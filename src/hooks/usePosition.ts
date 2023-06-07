import { BigNumber } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import { errorLog, infoLog } from "~/utils/log";
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
import { Position, PositionStructOutput } from "~/typings/position";
import { filterIfFulfilled } from "~/utils/array";
import useOracleVersion from "./useOracleVersion";
import { bigNumberify } from "~/utils/number";
import { useFeeRate } from "./useFeeRate";
import { useSelectedToken } from "./useSettlementToken";

export const usePosition = () => {
  const [usumAccount] = useUsumAccount();
  const [token] = useSelectedToken();
  const [markets] = useMarket();
  const provider = useProvider();
  const [router] = useRouter();
  const { oracleVersions } = useOracleVersion();
  const feeRate = useFeeRate();

  const fetchKey = useMemo(
    () =>
      isValid(usumAccount) &&
      isValid(markets) &&
      isValid(oracleVersions) &&
      isValid(provider)
        ? ([
            usumAccount,
            markets.map((market) => market.address),
            oracleVersions,
            provider,
          ] as const)
        : undefined,
    [usumAccount, markets, oracleVersions, provider]
  );

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(fetchKey, async ([account, markets, oracleVersions, provider]) => {
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
        const newPosition = new Position(response, marketAddress, "long");
        newPosition.createCollateral(feeRate ?? bigNumberify(0));
        newPosition.createTakeProfit();
        newPosition.createStopLoss();

        const { price: currentPrice, decimals: oracleDecimals } =
          oracleVersions[marketAddress];
        newPosition.createCurrentPrice(currentPrice);
        newPosition.createOraclePrice([openPrice, closePrice]);
        newPosition.createLiquidationPrice(token?.decimals);
        newPosition.createPNL(oracleDecimals);
        newPosition.createPriceTo(oracleDecimals);

        return newPosition;
      });
      const positions = await filterIfFulfilled(positionsPromise);
      return positions;
    });
    const positions = await filterIfFulfilled(positionsPromise);
    infoLog("positions", positions);
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
