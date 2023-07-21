import {
  ChromaticAccount,
  ChromaticPosition,
  IPosition as IChromaticPosition,
} from '@chromatic-protocol/sdk-viem';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useMarket } from '~/hooks/useMarket';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { OracleVersion } from '~/typings/oracleVersion';
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

function determinePositionStatus(position: IChromaticPosition, currentOracleVersion: bigint) {
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
}

export async function getPositions(
  accountApi: ChromaticAccount,
  positionApi: ChromaticPosition,
  oracleVersions: Record<`0x${string}`, OracleVersion>,
  marketAddress: `0x${string}`,
  tokenDecimals: number
) {
  const positionIds = await accountApi.getPositionIds(marketAddress);
  const positions = await positionApi.getPositions(marketAddress, [...positionIds]);
  const { price: currentPrice, version: currentVersion } = oracleVersions[marketAddress];
  return PromiseOnlySuccess(
    positions.map(async (position) => {
      const { profitStopPrice = 0n, lossCutPrice = 0n } = await positionApi.getLiquidationPrice(
        marketAddress,
        position.openPrice,
        position,
        tokenDecimals
      );
      const targetPrice =
        position.closePrice && position.closePrice !== 0n ? position.closePrice : currentPrice;
      const pnl = position.openPrice
        ? await positionApi.getPnl(
            marketAddress,
            position.openPrice,
            targetPrice,
            position,
            tokenDecimals
          )
        : 0n;
      return {
        ...position,
        marketAddress,
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
}

export function useDedicationPositions() {
  const { currentSelectedToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { client } = useChromaticClient();
  const { oracleVersions } = useOracleVersion();
  const fetchKey = useMemo(() => {
    const key = {
      id: 'useDedicatedPositions',
      currentSelectedToken,
      currentMarket,
      oracleVersions,
      client,
    };
    return checkAllProps(key) ? key : undefined;
  }, [currentSelectedToken, currentMarket, oracleVersions, client]);
  const {
    data: positions,
    mutate: fetchPositions,
    isLoading: isPositionsLoading,
    error,
  } = useSWR(fetchKey, async ({ currentSelectedToken, currentMarket, oracleVersions, client }) => {
    return getPositions(
      client.account(),
      client.position(),
      oracleVersions,
      currentMarket.address,
      currentSelectedToken.decimals
    );
  });

  useError({ error });

  return {
    positions,
    isPositionsLoading,
    fetchPositions,
  };
}

export const usePosition = () => {
  const { accountAddress: chromaticAccount, fetchBalances } = useUsumAccount();
  const { currentSelectedToken } = useSettlementToken();
  const { markets } = useMarket();
  const { oracleVersions } = useOracleVersion();
  const { client } = useChromaticClient();

  const fetchKey = {
    name: 'usePositions',
    markets: markets,
    chromaticAccount: chromaticAccount,
    client: client,
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
    async ({ chromaticAccount, client, currentSelectedToken, markets, oracleVersions }) => {
      const positionsPromise = markets.map(async (market) => {
        return getPositions(
          client.account(),
          client.position(),
          oracleVersions,
          market.address,
          currentSelectedToken.decimals
        );
      });
      const positions = await filterIfFulfilled(positionsPromise);
      return positions.flat(1);
    }
  );

  useError({ error, logger });

  return {
    positions,
    isPositionsLoading,
    fetchPositions,
  };
};
