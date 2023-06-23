import { BigNumber, BigNumberish } from 'ethers';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Logger, errorLog } from '~/utils/log';
import { isValid } from '~/utils/valid';

import {
  ChromaticMarket__factory,
  IOracleProvider__factory,
} from '@chromatic-protocol/sdk/contracts';
import { useProvider } from 'wagmi';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { createPositionsMock } from '~/mock/positions';
import { AppError } from '~/typings/error';
import { filterIfFulfilled } from '~/utils/array';
import { useAppSelector } from '../store';
import { useUsumBalances } from './useBalances';
import { useChromaticClient } from './useChromaticClient';
import { useFeeRate } from './useFeeRate';
import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk';
import useOracleVersion from './useOracleVersion';
import { current } from '@reduxjs/toolkit';
const logger = Logger('usePosition');
export type PositionStatus = 'opened' | 'closed' | ' closing';
export interface Position extends IChromaticPosition {
  marketAddress: string;
  lossPrice: BigNumberish;
  profitPrice: BigNumberish;
  // stopLoss: BigNumberish;
  status: string;
  toProfit: BigNumberish;
  collateral: BigNumberish;
  toLoss: BigNumberish;
  pnl: BigNumberish;
}
export const usePosition = () => {
  const { account: usumAccount } = useUsumAccount();
  const { fetchUsumBalances } = useUsumBalances();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { markets } = useMarket();
  const provider = useProvider();

  // const [router] = useRouter();

  const { oracleVersions } = useOracleVersion();
  const feeRate = useFeeRate();
  const { client } = useChromaticClient();
  const positionApi = useMemo(() => client?.position(), [client]);

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(
    ['POSITIONS', usumAccount?.address, markets, JSON.stringify(oracleVersions)],
    async () => {
      if (!isValid(markets)) {
        console.error('NO MARKETS');
        return;
      }
      if (!isValid(usumAccount)) {
        console.error('NO USUMACCOUNT');
        return;
      }
      if (!isValid(oracleVersions)) {
        console.error('NO ORACLE VERSIONS');
        return;
      }
      if (!isValid(positionApi)) {
        console.error('NO POSITION APIS');
        return;
      }
      console.log('PASSED ARGUMENTS');
      console.log('MARKETS', markets?.length);
      const positionsPromise = markets.map(async (market) => {
        const positionIds = await usumAccount.getPositionIds(market.address);
        console.log('POSITION IDS', positionIds);
        const marketContract = ChromaticMarket__factory.connect(market.address, provider);
        const oracleProviderAddress = await marketContract.oracleProvider();
        console.log('ORACLE PROVIDER', oracleProviderAddress);
        const marketOracleProvider = IOracleProvider__factory.connect(
          oracleProviderAddress,
          provider
        );
        const positions = await positionApi
          ?.getPositions(market.address, positionIds)
          .catch((err) => {
            console.error(err);
            return [];
          });

        console.log('POSITIONS', positions?.length);
        return Promise.all(
          positions?.map(async (position) => {
            const { profitStopPrice, lossCutPrice } = await positionApi?.getLiquidationPrice(
              market.address,
              position.openPrice,
              position
            );
            const currentPrice = oracleVersions[market.address].price;
            const currentVersion = oracleVersions[market.address].version;
            const pnl = position.openPrice
              ? await positionApi.getPnl(market.address, position.openPrice, currentPrice, position)
              : 0;
            logger.info('pnl', pnl);
            return {
              ...position,
              marketAddress: market.address,
              lossPrice: lossCutPrice,
              profitPrice: profitStopPrice,
              pnl,
              collateral: 0, //TODO ,
              status: determinePositionStatus(position, currentVersion),
              toLoss: lossCutPrice.sub(currentPrice),
              toProfit: profitStopPrice.sub(currentPrice),
            } satisfies Position;
          })
        );

        // const positionResponses = await marketContract.getPositions(positionIds);
        // const positionsPromise = positionResponses.map(async (response) => {
        //   const openPrice = await marketOracleProvider.atVersion(
        //     response.openVersion
        //   );
        //   const closePrice = await marketOracleProvider.atVersion(
        //     response.closeVersion
        //   );
        //   positionApi?.getInterestFee(marketAddresses, positi)
        //   const newPosition = new Position(response, market.address);
        //   newPosition.updateCollateral(feeRate ?? bigNumberify(0));
        //   newPosition.updateTakeProfit();
        //   newPosition.updateStopLoss();

        //   const { price: currentPrice, decimals: oracleDecimals } =
        //     oracleVersions?.[market.address];
        //   newPosition.updateCurrentPrice(currentPrice);
        //   newPosition.updateOraclePrice([openPrice, closePrice]);
        //   newPosition.updateLiquidationPrice(token?.decimals);
        //   newPosition.updatePNL(oracleDecimals);
        //   newPosition.updatePriceTo(oracleDecimals);
        //   newPosition.updateStatus(oracleVersions);

        //   return newPosition;
        // });
        // const positions = await filterIfFulfilled(positionsPromise);
        // return positions;
      });
      const positions = await filterIfFulfilled(positionsPromise);
      return positions.flat(1);
    }
  );
  const determinePositionStatus = useCallback(
    (position: IChromaticPosition, currentOracleVersion: BigNumber) => {
      if (currentOracleVersion.eq(position.openVersion)) {
        return 'opening';
      }
      if (!position.closeVersion.eq(0) && currentOracleVersion.eq(position.closeVersion)) {
        return 'closing';
      }
      if (!position.closeVersion.eq(0) && currentOracleVersion.gt(position.closeVersion)) {
        return 'closed';
      }
      return 'opening';
    },
    []
  );

  const closedPositions = useMemo(() => {
    if (!isValid(positions) || !positions.length) {
      return [];
    }
    const closed = positions.filter((position) => {
      return !position.closeVersion.eq(0);
    });
    return closed;
  }, [positions]);

  const onClosePosition = async (marketAddress: string, positionId: BigNumber) => {
    if (!isValid(client?.router())) {
      errorLog('no router contracts');
      return AppError.reject('no router contracts', 'onClosePosition');
    }
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (!isValid(position)) {
      errorLog('no positions');
      return AppError.reject('no positions', 'onClosePosition');
    }
    try {
      await client?.router()?.closePosition(position.marketAddress, {
        positionId: position.id,
        marketAdddress: position.marketAddress,
      });

      fetchPositions();
    } catch (error) {
      errorLog(error);

      return AppError.reject(error, 'onClosePosition');
    }
  };

  const onClaimPosition = async (marketAddress: string, positionId: BigNumber) => {
    if (!isValid(client?.router())) {
      return AppError.reject('no router contractsd', 'onClaimPosition');
    }
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (!isValid(position)) {
      errorLog('no positions');
      return AppError.reject('no positions', 'onClosePosition');
    }
    if (oracleVersions?.[marketAddress]?.version.lte(position.closeVersion)) {
      errorLog('the selected position is not closed');

      return AppError.reject('the selected position is not closed', 'onClaimPosition');
    }

    // await client?.lens()?.claimPosition(position.marketAddress, position.id);

    await fetchPositions();
    await fetchUsumBalances();
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
