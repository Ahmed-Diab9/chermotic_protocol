import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { Position } from '~/typings/position';
import { filterIfFulfilled } from '~/utils/array';
import { Logger } from '~/utils/log';
import { divPreserved } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { checkAllProps, isNilOrEmpty } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useOracleVersion from './useOracleVersion';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('usePosition');

export const usePosition = () => {
  const { accountAddress: chromaticAccount, fetchBalances } = useUsumAccount();
  const { currentSelectedToken } = useSettlementToken();
  const { markets } = useMarket();
  const { oracleVersions } = useOracleVersion();
  const { client } = useChromaticClient();
  // const positionApi = useMemo(() => client?.position(), [client]);
  // const accountApi = useMemo(() => client?.account(), [client]);

  const fetchKey = {
    name: 'getPositions',
    markets: markets,
    chromaticAccount: chromaticAccount,
    positionApi: useMemo(() => client?.position(), [client]),
    accountApi: useMemo(() => client?.account(), [client]),
    currentSelectedToken: currentSelectedToken,
    oracleVersions: !isNilOrEmpty(oracleVersions) ? oracleVersions : null,
  };
  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading: isPositionsLoading,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({
      chromaticAccount,
      currentSelectedToken,
      markets,
      accountApi,
      positionApi,
      oracleVersions,
    }) => {
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
              position.closePrice && position.closePrice !== 0n
                ? position.closePrice
                : currentPrice;
            const pnl = position.openPrice
              ? await positionApi.getPnl(
                  market.address,
                  position.openPrice,
                  targetPrice,
                  position,
                  currentSelectedToken.decimals
                )
              : 0n;
            return {
              ...position,
              marketAddress: market.address,
              lossPrice: lossCutPrice ?? 0n,
              profitPrice: profitStopPrice ?? 0n,
              pnl,
              collateral: position.takerMargin, //TODO ,
              status: determinePositionStatus(position, currentVersion),
              toLoss: isValid(lossCutPrice)
                ? divPreserved(lossCutPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
                : 0n,
              toProfit: isValid(profitStopPrice)
                ? divPreserved(
                    profitStopPrice - currentPrice,
                    currentPrice,
                    ORACLE_PROVIDER_DECIMALS
                  )
                : 0n,
            } satisfies Position;
          })
        );
      });
      const positions = await filterIfFulfilled(positionsPromise);
      return positions.flat(1);
    }
  );
  const determinePositionStatus = useCallback(
    (position: IChromaticPosition, currentOracleVersion: bigint) => {
      if (currentOracleVersion === position.openVersion) {
        return 'opening';
      }
      if (position.closeVersion !== 0n && currentOracleVersion === position.closeVersion) {
        return 'closing';
      }
      if (position.closeVersion !== 0n && currentOracleVersion > position.closeVersion) {
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
