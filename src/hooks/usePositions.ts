import {
  ChromaticAccount,
  ChromaticMarket,
  ChromaticPosition,
  IPosition as IChromaticPosition,
} from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useCallback } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useAppDispatch } from '~/store';
import { Market } from '~/typings/market';
import { POSITION_STATUS, Position } from '~/typings/position';
import { Logger } from '~/utils/log';
import { divPreserved } from '~/utils/number';
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import useFilteredMarkets from './commons/useFilteredMarkets';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
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
  markets: Market[],
  walletAddress: Address
) {
  const positionIds = await PromiseOnlySuccess(
    markets.map(async (market) => {
      const idsPromise = accountApi.getPositionIds(market.address);
      const oraclePromise = marketApi.getCurrentPrice(market.address);
      const [idsSettled, oracleSettled] = await Promise.allSettled([idsPromise, oraclePromise]);
      if (oracleSettled.status === 'rejected' || idsSettled.status === 'rejected') {
        throw new Error('Failed to fetch position ids');
      }
      return {
        market,
        oracle: oracleSettled.value,
        ids: idsSettled.value,
      };
    })
  );
  const positionsResponse = await PromiseOnlySuccess(
    positionIds.map(async ({ market, oracle, ids = [] }) => {
      const positions = await positionApi.getPositions(market.address, [...ids]);
      return positions.map((position) => ({ position, market, oracle }));
    })
  );
  const withLiquidation = await PromiseOnlySuccess(
    positionsResponse
      .flat(1)
      .filter(({ position }) => position.owner === walletAddress)
      .map(async ({ position, market, oracle }) => {
        const { price: currentPrice, version: currentVersion } = oracle;
        const { profitStopPrice = 0n, lossCutPrice = 0n } = await positionApi.getLiquidationPrice(
          market.address,
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
          marketAddress: market.address,
          tokenAddress: market.tokenAddress,
          oracle,
        };
      })
  );

  const withPnl = await PromiseOnlySuccess(
    withLiquidation.map(async ({ oracle, ...position }) => {
      const { price: currentPrice } = oracle;
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
  const { client } = useChromaticClient();
  const dispatch = useAppDispatch();
  const { markets } = useFilteredMarkets();

  const fetchKey = {
    name: 'getPositions',
    type: 'EOA',
    markets,
    chromaticAccount: accountAddress,
  };

  const {
    data: positions,
    error,
    mutate: fetchPositions,
    isLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ markets, chromaticAccount }) => {
      const accountApi = client.account();
      const positionApi = client.position();
      const marketApi = client.market();
      return getPositions(accountApi, positionApi, marketApi, markets, chromaticAccount);
    },
    {
      // TODO: Find proper interval seconds
      refreshInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateFirstPage: true,
      shouldRetryOnError: false,
    }
  );

  const fetchCurrentPositions = useCallback(
    async (marketAddress: Address) => {
      if (isNil(positions) || isNil(accountAddress)) return positions;
      const filteredPositions = positions
        ?.filter((p) => !!p)
        .filter((position) => position.marketAddress !== marketAddress);

      const accountApi = client.account();
      const positionApi = client.position();
      const marketApi = client.market();
      const foundMarket = markets?.find((market) => market.address === marketAddress);

      if (isNil(foundMarket)) {
        return;
      }

      const newPositions = await getPositions(
        accountApi,
        positionApi,
        marketApi,
        [foundMarket],
        accountAddress
      );
      const mergedPositions = [...filteredPositions, ...newPositions];
      mergedPositions.sort((previous, next) => (previous.id < next.id ? 1 : -1));
      await fetchPositions<Position[]>(mergedPositions, { revalidate: false });
    },
    [client, markets, positions, accountAddress, fetchPositions]
  );

  useError({
    error,
    logger,
  });

  return {
    positions,
    fetchPositions,
    fetchCurrentPositions,
    isLoading,
    error,
  };
};
