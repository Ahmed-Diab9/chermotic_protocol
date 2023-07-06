import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Logger, errorLog } from '~/utils/log';
import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-ethers-v5';
import { isNil } from 'ramda';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { filterIfFulfilled } from '~/utils/array';
import { useChromaticClient } from './useChromaticClient';
import useOracleVersion from './useOracleVersion';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('usePosition');
export type PositionStatus = 'opened' | 'closed' | ' closing';
export interface Position extends IChromaticPosition {
  marketAddress: string;
  lossPrice: BigNumber;
  profitPrice: BigNumber;
  status: string;
  toProfit: BigNumber;
  collateral: BigNumber;
  toLoss: BigNumber;
  pnl: 0 | BigNumber;
}
export const usePosition = () => {
  const { accountAddress: usumAccount, fetchBalances } = useUsumAccount();
  const { currentSelectedToken } = useSettlementToken();
  const { markets } = useMarket();
  const { oracleVersions } = useOracleVersion();
  const { client } = useChromaticClient();
  const positionApi = useMemo(() => client?.position(), [client]);
  const accountApi = useMemo(() => client?.account(), [client]);

  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading: isPositionsLoading,
  } = useSWR(['POSITIONS', usumAccount, markets, JSON.stringify(oracleVersions)], async () => {
    if (isNil(markets)) {
      logger.error('NO MARKETS');
      return [];
    }
    if (isNil(client?.signer)) {
      return [];
    }
    if (isNil(usumAccount)) {
      logger.error('NO USUMACCOUNT');
      return [];
    }
    if (isNil(oracleVersions) || Object.keys(oracleVersions).length <= 0) {
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
    if (isNil(currentSelectedToken)) {
      logger.error('No Settlemet tokens');
      return [];
    }

    const positionsPromise = markets.map(async (market) => {
      const positionIds = await accountApi.getPositionIds(market.address);

      const positions = await positionApi
        ?.getPositions(market.address, positionIds)
        .catch((err) => {
          logger.error(err);
          return [];
        });

      logger.log('POSITIONS', positions);
      const response = await Promise.allSettled(
        positions?.map(async (position) => {
          const { profitStopPrice, lossCutPrice } = await positionApi?.getLiquidationPrice(
            market.address,
            position.openPrice,
            position,
            currentSelectedToken.decimals
          );
          const currentPrice = oracleVersions[market.address].price;
          const currentVersion = oracleVersions[market.address].version;
          const targetPrice =
            position.closePrice && !position.closePrice.isZero()
              ? position.closePrice
              : currentPrice;
          const pnl = position.openPrice
            ? await positionApi.getPnl(market.address, position.openPrice, targetPrice, position)
            : 0;
          return {
            ...position,
            marketAddress: market.address,
            lossPrice: lossCutPrice,
            profitPrice: profitStopPrice,
            pnl,
            collateral: position.takerMargin, //TODO ,
            status: determinePositionStatus(position, currentVersion),
            toLoss: lossCutPrice.sub(currentPrice),
            toProfit: profitStopPrice.sub(currentPrice),
          } satisfies Position;
        })
      );
      return response
        .filter(
          (element): element is PromiseFulfilledResult<Position> => element.status === 'fulfilled'
        )
        .map(({ value }) => value);
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
      return 'opened';
    },
    []
  );

  if (error) {
    errorLog(error);
  }

  return {
    positions,
    isPositionsLoading,
    fetchPositions,
  };
};
