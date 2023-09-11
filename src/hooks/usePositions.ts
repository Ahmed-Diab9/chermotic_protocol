import {
  ChromaticAccount,
  ChromaticPosition,
  IPosition as IChromaticPosition,
} from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { useAppSelector } from '~/store';
import { Market } from '~/typings/market';
import { POSITION_STATUS, Position } from '~/typings/position';
import { Logger } from '~/utils/log';
import { divPreserved } from '~/utils/number';
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('usePosition');

function determinePositionStatus(position: IChromaticPosition, currentOracleVersion: bigint) {
  if (currentOracleVersion === position.openVersion) {
    return POSITION_STATUS.OPENING;
  }
  if (position.closeVersion !== 0n && currentOracleVersion === position.closeVersion) {
    return POSITION_STATUS.CLOSING;
  }
  if (position.closeVersion !== 0n && currentOracleVersion > position.closeVersion) {
    return POSITION_STATUS.CLOSED;
  }
  return POSITION_STATUS.OPENED;
}

async function getPositions(
  accountApi: ChromaticAccount,
  positionApi: ChromaticPosition,
  market: Market
) {
  const positionIds = await accountApi.getPositionIds(market.address);

  const positions = await positionApi.getPositions(market.address, [...positionIds]);

  const { price: currentPrice, version: currentVersion } = market.oracleValue;
  const withLiquidation = await PromiseOnlySuccess(
    positions.map(async (position) => {
      const { profitStopPrice = 0n, lossCutPrice = 0n } = await positionApi.getLiquidationPrice(
        market.address,
        position.openPrice,
        position
      );
      const targetPrice =
        position.closePrice && position.closePrice !== 0n ? position.closePrice : currentPrice;
      const pnl = position.openPrice
        ? await positionApi.getPnl(market.address, position.openPrice, targetPrice, position)
        : 0n;
      return {
        ...position,
        tokenAddress: market.tokenAddress,
        marketAddress: market.address,
        lossPrice: lossCutPrice ?? 0n,
        profitPrice: profitStopPrice ?? 0n,
        pnl,
        collateral: position.takerMargin, //TODO ,
        status: determinePositionStatus(position, currentVersion),
        toLoss: isNotNil(lossCutPrice)
          ? divPreserved(lossCutPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
          : 0n,
        toProfit: isNotNil(profitStopPrice)
          ? divPreserved(profitStopPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
          : 0n,
      } satisfies Position;
    })
  );

  return withLiquidation.sort((leftPosition, rightPosition) => {
    return leftPosition.id < rightPosition.id ? 1 : -1;
  });
}

export const usePositions = () => {
  const { accountAddress } = useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { markets: entireMarkets } = useEntireMarkets();
  const { markets, currentMarket } = useMarket();
  const { client } = useChromaticClient();
  const filterOption = useAppSelector((state) => state.position.filterOption);

  const fetchKey = {
    name: 'getPositions',
    type: 'EOA',
    markets,
    entireMarkets,
    chromaticAccount: accountAddress,
    currentToken: currentToken,
    filterOption,
  };

  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ currentToken, markets, entireMarkets, filterOption }) => {
      const accountApi = client.account();
      const positionApi = client.position();

      const filteredMarkets =
        filterOption === 'ALL'
          ? entireMarkets
          : filterOption === 'TOKEN_BASED'
          ? markets
          : markets.filter((market) => market.address === currentMarket?.address);
      const positionsResponse = await PromiseOnlySuccess(
        filteredMarkets.map(async (market) => {
          return getPositions(accountApi, positionApi, market);
        })
      );
      return positionsResponse.flat(1);
    }
  );

  function fetchCurrentPositions() {
    fetchPositions(async (positions) => {
      if (isNil(positions) || isNil(accountAddress) || isNil(currentMarket) || isNil(currentToken))
        return positions;

      const filteredPositions = positions
        ?.filter((p) => !!p)
        .filter((position) => position.marketAddress !== currentMarket?.address);

      const accountApi = client.account();
      const positionApi = client.position();

      const newPositions = await getPositions(accountApi, positionApi, currentMarket);
      return [...filteredPositions, ...newPositions];
    });
  }

  const currentPositions = useMemo(() => {
    return positions?.filter(
      ({ marketAddress, tokenAddress }) =>
        marketAddress === currentMarket?.address && tokenAddress === currentToken?.address
    );
  }, [positions, currentMarket, currentToken]);

  useError({
    error,
    logger,
  });

  return {
    positions,
    fetchPositions,
    currentPositions,
    fetchCurrentPositions,
    isLoading,
    error,
  };
};
