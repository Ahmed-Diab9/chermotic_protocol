import { BigNumber, BigNumberish } from 'ethers';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Logger, errorLog } from '~/utils/log';
import { isValid } from '~/utils/valid';

import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk';
import { ChromaticMarket__factory } from '@chromatic-protocol/sdk/contracts';
import { isNil } from 'ramda';
import { useProvider } from 'wagmi';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { createPositionsMock } from '~/mock/positions';
import { AppError } from '~/typings/error';
import { filterIfFulfilled } from '~/utils/array';
import { useAppSelector } from '../store';
import { useChromaticClient } from './useChromaticClient';
import { useFeeRate } from './useFeeRate';
import useOracleVersion from './useOracleVersion';
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
  const { accountAddress: usumAccount, fetchBalances } = useUsumAccount();
  // const { fetchUsumBalances } = useUsumBalances();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { markets } = useMarket();
  const provider = useProvider();

  // const [router] = useRouter();

  const { oracleVersions } = useOracleVersion();
  const feeRate = useFeeRate();
  const { client } = useChromaticClient();
  const positionApi = useMemo(() => client?.position(), [client]);
  const accountApi = useMemo(() => client?.account(), [client]);

  const {
    data: positions,
    error,
    mutate: fetchPositions,
  } = useSWR(['POSITIONS', usumAccount, markets, JSON.stringify(oracleVersions)], async () => {
    if (isNil(markets)) {
      logger.error('NO MARKETS');
      return [];
    }
    if (isNil(usumAccount)) {
      logger.error('NO USUMACCOUNT');
      return [];
    }
    if (isNil(oracleVersions)) {
      logger.error('NO ORACLE VERSIONS');
      return [];
    }
    if (isNil(positionApi)) {
      logger.error('NO POSITION APIS');
      return [];
    }
    if (isNil(accountApi)) {
      return [];
    }
    // logger.log('PASSED ARGUMENTS');
    // logger.log('MARKETS', markets?.length);
    const positionsPromise = markets.map(async (market) => {
      logger.info('market addr', market.address);
      const positionIds = await accountApi.getPositionIds(market.address);
      logger.log('POSITION IDS', positionIds);
      const marketContract = ChromaticMarket__factory.connect(market.address, provider);
      const oracleProviderAddress = await marketContract.oracleProvider();
      logger.log('ORACLE PROVIDER', oracleProviderAddress);

      const positions = await positionApi
        ?.getPositions(market.address, positionIds)
        .catch((err) => {
          logger.error(err);
          return [];
        });

      logger.log('POSITIONS', positions?.length);
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
    });
    const positions = await filterIfFulfilled(positionsPromise);
    return positions.flat(1);
  });
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
    if (isNil(positions) || !positions.length) {
      return [];
    }
    const closed = positions.filter((position) => {
      return !position.closeVersion.eq(0);
    });
    return closed;
  }, [positions]);

  const onClosePosition = async (marketAddress: string, positionId: BigNumber) => {
    if (isNil(client?.router())) {
      errorLog('no router contracts');
      return AppError.reject('no router contracts', 'onClosePosition');
    }
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (isNil(position)) {
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
    if (isNil(client?.router())) {
      return AppError.reject('no router contractsd', 'onClaimPosition');
    }
    const position = positions?.find(
      (position) => position.marketAddress === marketAddress && position.id === positionId
    );
    if (isNil(position)) {
      errorLog('no positions');
      return AppError.reject('no positions', 'onClosePosition');
    }
    if (oracleVersions?.[marketAddress]?.version.lte(position.closeVersion)) {
      errorLog('the selected position is not closed');

      return AppError.reject('the selected position is not closed', 'onClaimPosition');
    }

    // await client?.lens()?.claimPosition(position.marketAddress, position.id);

    await fetchPositions();
    await fetchBalances();
    // await fetchUsumBalances();
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
