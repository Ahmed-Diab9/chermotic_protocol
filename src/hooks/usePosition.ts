import { BigNumber } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import { errorLog, infoLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

import { useProvider } from "wagmi";
import { useMarket } from "~/hooks/useMarket";
import { useRouter } from "~/hooks/useRouter";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { createPositionsMock } from "~/mock/positions";
import { AppError } from "~/typings/error";
import { Position } from "~/typings/position";
import { filterIfFulfilled } from "~/utils/array";
import useOracleVersion from "./useOracleVersion";
import { bigNumberify } from "~/utils/number";
import { useFeeRate } from "./useFeeRate";
import { useAppSelector } from "../store";
import { handleTx } from "~/utils/tx";
import { useUsumBalances } from "./useBalances";
import {
  ChromaticMarket__factory,
  IOracleProvider__factory,
} from "@chromatic-protocol/sdk/contracts";

export const usePosition = () => {
  const { account: usumAccount } = useUsumAccount();
  const { fetchUsumBalances } = useUsumBalances();
  const token = useAppSelector((state) => state.market.selectedToken);
  const {markets} = useMarket();
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
      const marketOracleProvider = IOracleProvider__factory.connect(
        oracleProviderAddress,
        provider
      );

      const positionResponses = await marketContract.getPositions(positionIds);
      const positionsPromise = positionResponses.map(async (response) => {
        const openPrice = await marketOracleProvider.atVersion(
          response.openVersion
        );
        const closePrice = await marketOracleProvider.atVersion(
          response.closeVersion
        );

        const newPosition = new Position(response, marketAddress);
        newPosition.updateCollateral(feeRate ?? bigNumberify(0));
        newPosition.updateTakeProfit();
        newPosition.updateStopLoss();

        const { price: currentPrice, decimals: oracleDecimals } =
          oracleVersions[marketAddress];
        newPosition.updateCurrentPrice(currentPrice);
        newPosition.updateOraclePrice([openPrice, closePrice]);
        newPosition.updateLiquidationPrice(token?.decimals);
        newPosition.updatePNL(oracleDecimals);
        newPosition.updatePriceTo(oracleDecimals);
        newPosition.updateStatus(oracleVersions);

        return newPosition;
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
    const closed = positions.filter((position) => {
      return !position.closeVersion.eq(0);
    });
    return closed;
  }, [positions]);

  const onClosePosition = async (
    marketAddress: string,
    positionId: BigNumber
  ) => {
    if (!isValid(router)) {
      errorLog("no router contracts");
      return AppError.reject("no router contracts", "onClosePosition");
    }
    const position = positions?.find(
      (position) =>
        position.marketAddress === marketAddress && position.id === positionId
    );
    if (!isValid(position)) {
      errorLog("no positions");
      return AppError.reject("no positions", "onClosePosition");
    }
    try {
      const tx = await router?.closePosition(
        position.marketAddress,
        position.id
      );

      handleTx(tx, fetchPositions);
    } catch (error) {
      errorLog(error);

      return AppError.reject(error, "onClosePosition");
    }
  };

  const onClaimPosition = async (
    marketAddress: string,
    positionId: BigNumber
  ) => {
    if (!isValid(router)) {
      return AppError.reject("no router contractsd", "onClaimPosition");
    }
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

    const tx = await router?.claimPosition(position.marketAddress, position.id);

    handleTx(tx, fetchPositions, fetchUsumBalances);
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
  const { account } = useUsumAccount();

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
