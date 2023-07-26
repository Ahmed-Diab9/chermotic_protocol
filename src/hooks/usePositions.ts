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
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useOracleVersion from './useOracleVersion';
import { useSettlementToken } from './useSettlementToken';
import { Address } from 'wagmi';
import { isNil } from 'ramda';
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

async function getPositions(
  accountApi: ChromaticAccount,
  positionApi: ChromaticPosition,
  oracleVersions: Record<Address, OracleVersion>,
  marketAddress: Address,
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

export const usePositions = () => {
  const { accountAddress } = useUsumAccount();
  const { currentToken } = useSettlementToken();
  const { markets, currentMarket } = useMarket();
  const { oracleVersions } = useOracleVersion();
  const { client } = useChromaticClient();

  const fetchKey = {
    name: 'getPositions',
    type: 'EOA',
    markets: markets,
    chromaticAccount: accountAddress,
    currentToken: currentToken,
    oracleVersions: oracleVersions,
  };

  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ currentToken, markets, oracleVersions }) => {
      const accountApi = client.account();
      const positionApi = client.position();

      const positionsPromise = markets.map(async (market) => {
        return getPositions(
          accountApi,
          positionApi,
          oracleVersions,
          market.address,
          currentToken.decimals
        );
      });
      const positions = await filterIfFulfilled(positionsPromise);
      return positions.flat(1);
    }
  );

  const currentMarketPositions = useMemo(() => {
    if (isNil(currentMarket)) return undefined;
    const filtered = positions?.filter(
      (position) => position.marketAddress === currentMarket.address
    );
    return filtered;
  }, [positions, currentMarket]);

  useError({
    error,
    logger,
  });

  return {
    positions,
    currentMarketPositions,
    fetchPositions,
    isLoading,
    error,
  };
};
