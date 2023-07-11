import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { Logger } from '~/utils/log';
import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { filterIfFulfilled } from '~/utils/array';
import { useChromaticClient } from './useChromaticClient';
import useOracleVersion from './useOracleVersion';
import { useSettlementToken } from './useSettlementToken';
import { PromiseOnlySuccess } from '../utils/promise';
import { Address } from 'wagmi';
import { useError } from './useError';
const logger = Logger('usePosition');
export type PositionStatus = 'opened' | 'closed' | ' closing';
export interface Position extends IChromaticPosition {
  marketAddress: Address;
  lossPrice: bigint;
  profitPrice: bigint;
  status: string;
  toProfit: bigint;
  collateral: bigint;
  toLoss: bigint;
  pnl: 0 | bigint;
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
    if (isNil(client?.walletClient)) {
      return [];
    }

    const positionsPromise = markets.map(async (market) => {
      const positionIds = await accountApi.getPositionIds(market.address);

      const positions = await positionApi
        ?.getPositions(market.address, [...positionIds])
        .catch((err) => {
          logger.error(err);
          return [];
        });

      logger.log('POSITIONS', positions);
      return await PromiseOnlySuccess(
        positions?.map(async (position) => {
          const { profitStopPrice = BigInt(0), lossCutPrice = BigInt(0) } =
            await positionApi?.getLiquidationPrice(
              market.address,
              position.openPrice,
              position,
              currentSelectedToken.decimals
            );
          const currentPrice = oracleVersions[market.address].price;
          const currentVersion = oracleVersions[market.address].version;
          const targetPrice =
            position.closePrice && position.closePrice !== 0n ? position.closePrice : currentPrice;
          const pnl = position.openPrice
            ? await positionApi.getPnl(market.address, position.openPrice, targetPrice, position)
            : 0n;
          return {
            ...position,
            marketAddress: market.address,
            lossPrice: lossCutPrice ?? 0n,
            profitPrice: profitStopPrice || 0n,
            pnl,
            collateral: position.takerMargin, //TODO ,
            status: determinePositionStatus(position, currentVersion),
            toLoss: lossCutPrice ? lossCutPrice - currentPrice : 0n,
            toProfit: profitStopPrice ? profitStopPrice - currentPrice : 0n,
          } satisfies Position;
        })
      );
    });
    const positions = await filterIfFulfilled(positionsPromise);
    return positions.flat(1);
  });
  const determinePositionStatus = useCallback(
    (position: IChromaticPosition, currentOracleVersion: bigint) => {
      if (currentOracleVersion === position.openVersion) {
        return 'opening';
      }
      if (position.closeVersion !== 0n && currentOracleVersion === position.closeVersion) {
        return 'closing';
      }
      if (position.closeVersion !== 0n && currentOracleVersion === position.closeVersion) {
        return 'closed';
      }
      return 'opened';
    },
    []
  );

  useError({ error, logger });

  return {
    positions,
    isPositionsLoading,
    fetchPositions,
  };
};
