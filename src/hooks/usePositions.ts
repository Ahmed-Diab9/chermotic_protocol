import {
  ChromaticAccount,
  ChromaticMarket,
  ChromaticPosition,
  IPosition as IChromaticPosition,
} from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { useAppDispatch, useAppSelector } from '~/store';
import { loadedAction } from '~/store/reducer/loaded';
import { MarketLike } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { POSITION_STATUS, Position } from '~/typings/position';
import { Logger } from '~/utils/log';
import { trimMarket, trimMarkets } from '~/utils/market';
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
  marketApi: ChromaticMarket,
  markets: MarketLike[],
  walletAddress: Address
) {
  const tuplesPromise = markets
    .map((market) => {
      const idsPromise = accountApi.getPositionIds(market.address);
      const oraclePromise = marketApi.getCurrentPrice(market.address);
      return [market.address, market.tokenAddress, oraclePromise, idsPromise] as const;
    })
    .flat(1);
  const tuples = await Promise.allSettled(tuplesPromise);
  const marketOracles = {} as Record<Address, OracleVersion>;
  const positionIds = [] as [Address, Address, bigint[]][];
  for (let index = 0; index < tuples.length; index++) {
    const item = tuples[index];
    if (item.status === 'rejected') {
      continue;
    }
    const tupleIndex = index % 4;
    const marketIndex = Math.floor(index / 4);
    switch (tupleIndex) {
      case 0: {
        const marketAddress = item.value as Address;
        marketOracles[marketAddress] = {} as OracleVersion;
        positionIds[marketIndex] = [marketAddress, '0x', []];
        continue;
      }
      case 1: {
        const tokenAddress = item.value as Address;
        positionIds[marketIndex][1] = tokenAddress;
        continue;
      }
      case 2: {
        marketOracles[positionIds[marketIndex][0]] = item.value as OracleVersion;
        continue;
      }
      case 3: {
        positionIds[marketIndex][2] = item.value as bigint[];
        continue;
      }
    }
  }
  const positionsResponse = positionIds.map(async ([marketAddress, tokenAddress, ids]) => {
    const positions = await positionApi.getPositions(marketAddress, [...ids]);
    return positions.map((position) => ({ ...position, marketAddress, tokenAddress }));
  });
  const positions = (await PromiseOnlySuccess(positionsResponse)).flat(1);

  const withLiquidation = await PromiseOnlySuccess(
    positions.map(async (position) => {
      const { price: currentPrice, version: currentVersion } =
        marketOracles[position.marketAddress];
      const { profitStopPrice = 0n, lossCutPrice = 0n } = await positionApi.getLiquidationPrice(
        position.marketAddress,
        position.openPrice,
        position
      );
      return {
        ...position,
        lossPrice: lossCutPrice ?? 0n,
        profitPrice: profitStopPrice ?? 0n,
        collateral: position.takerMargin, //TODO ,
        status: determinePositionStatus(position, currentVersion),
        toLoss: isNotNil(lossCutPrice)
          ? divPreserved(lossCutPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
          : 0n,
        toProfit: isNotNil(profitStopPrice)
          ? divPreserved(profitStopPrice - currentPrice, currentPrice, ORACLE_PROVIDER_DECIMALS)
          : 0n,
      } as Position;
    })
  );
  const withPnl = await PromiseOnlySuccess(
    withLiquidation
      .filter((position) => position.owner === walletAddress)
      .map(async (position) => {
        const { price: currentPrice } = marketOracles[position.marketAddress];
        const targetPrice =
          position.closePrice && position.closePrice !== 0n ? position.closePrice : currentPrice;
        const pnl = position.openPrice
          ? await positionApi.getPnl(
              position.marketAddress,
              position.openPrice,
              targetPrice,
              position
            )
          : 0n;
        return {
          ...position,
          pnl,
        } satisfies Position;
      })
  );

  return withPnl.sort((leftPosition, rightPosition) => {
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
  const dispatch = useAppDispatch();

  const fetchKey = {
    name: 'getPositions',
    type: 'EOA',
    markets: trimMarkets(markets),
    entireMarkets: trimMarkets(entireMarkets),
    currentMarket: trimMarket(currentMarket),
    chromaticAccount: accountAddress,
    filterOption,
  };

  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ markets, entireMarkets, currentMarket, filterOption, chromaticAccount }) => {
      const accountApi = client.account();
      const positionApi = client.position();
      const marketApi = client.market();

      const filteredMarkets =
        filterOption === 'ALL'
          ? entireMarkets
          : filterOption === 'TOKEN_BASED'
          ? markets
          : markets.filter((market) => market.address === currentMarket.address);
      return getPositions(accountApi, positionApi, marketApi, filteredMarkets, chromaticAccount);
    }
  );

  const fetchCurrentPositions = useCallback(async () => {
    if (isLoading) {
      return;
    }
    if (
      isNil(positions) ||
      isNil(accountAddress) ||
      isNil(currentMarket) ||
      isNil(currentToken) ||
      isNil(accountAddress)
    )
      return positions;

    const filteredPositions = positions
      ?.filter((p) => !!p)
      .filter((position) => position.marketAddress !== currentMarket?.address);

    const accountApi = client.account();
    const positionApi = client.position();
    const marketApi = client.market();

    const newPositions = await getPositions(
      accountApi,
      positionApi,
      marketApi,
      [currentMarket],
      accountAddress
    );
    const mergedPositions = [...filteredPositions, ...newPositions];
    mergedPositions.sort((previous, next) =>
      previous.openTimestamp < next.openTimestamp ? 1 : -1
    );
    await fetchPositions<Position[]>(mergedPositions, { revalidate: false });
  }, [client, isLoading, currentToken, currentMarket, positions, accountAddress, fetchPositions]);

  const currentPositions = useMemo(() => {
    return positions?.filter(
      ({ marketAddress, tokenAddress }) =>
        marketAddress === currentMarket?.address && tokenAddress === currentToken?.address
    );
  }, [positions, currentMarket, currentToken]);

  useEffect(() => {
    if (isNotNil(positions) && !isLoading) {
      dispatch(loadedAction.onDataLoaded('positions'));
    }
  }, [dispatch, isLoading, positions]);

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
