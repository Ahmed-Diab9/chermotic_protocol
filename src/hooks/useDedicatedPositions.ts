import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { Position } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';
import useOracleVersion from './useOracleVersion';
import { useSettlementToken } from './useSettlementToken';

export function useDedicationPositions() {
  const { currentSelectedToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { client } = useChromaticClient();
  const { oracleVersions } = useOracleVersion();
  const fetchKey = useMemo(() => {
    const key = {
      currentSelectedToken,
      currentMarket,
      oracleVersions,
      client,
    };
    return checkAllProps(key) ? key : undefined;
  }, [currentSelectedToken, currentMarket, oracleVersions, client]);
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
  const {
    data: positions,
    mutate: fetchPositions,
    isLoading: isPositionsLoading,
    error,
  } = useSWR(fetchKey, async ({ currentSelectedToken, currentMarket, oracleVersions, client }) => {
    const positionIds = await client.account().getPositionIds(currentMarket.address);
    const positions = await client.position().getPositions(currentMarket.address, [...positionIds]);
    const { price: currentPrice, version: currentVersion } = oracleVersions[currentMarket.address];
    return PromiseOnlySuccess(
      positions.map(async (position) => {
        const { profitStopPrice = 0n, lossCutPrice = 0n } = await client
          .position()
          .getLiquidationPrice(
            currentMarket.address,
            position.openPrice,
            position,
            currentSelectedToken.decimals
          );
        const targetPrice =
          position.closePrice && position.closePrice !== 0n ? position.closePrice : currentPrice;
        const pnl = position.openPrice
          ? await client
              .position()
              .getPnl(
                currentMarket.address,
                position.openPrice,
                targetPrice,
                position,
                currentSelectedToken.decimals
              )
          : 0n;
        return {
          ...position,
          marketAddress: currentMarket.address,
          lossPrice: lossCutPrice ?? 0n,
          profitPrice: profitStopPrice ?? 0n,
          pnl,
          collateral: position.takerMargin, //TODO ,
          status: determinePositionStatus(position, currentVersion),
          toLoss: isValid(lossCutPrice)
            ? divPreserved(lossCutPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
            : 0n,
          toProfit: isValid(profitStopPrice)
            ? divPreserved(profitStopPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
            : 0n,
        } satisfies Position;
      })
    );
  });

  useError({ error });

  return {
    positions,
    isPositionsLoading,
    fetchPositions,
  };
}
