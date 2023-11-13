import type { ChromaticLens } from '@chromatic-protocol/sdk-viem';
import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { poolsAction } from '~/store/reducer/pools';
import { isLpReadySelector, isPositionsReadySelector } from '~/store/selector';
import { FEE_RATES } from '../configs/feeRate';
import { useAppDispatch, useAppSelector } from '../store';
import { Bin, LiquidityPool } from '../typings/pools';
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useEntireMarkets, useMarket } from './useMarket';
import { usePrevious } from './usePrevious';
import { useSettlementToken } from './useSettlementToken';

const { encodeTokenId } = ChromaticUtils;

export const useLiquidityPools = () => {
  const { client } = useChromaticClient();
  const { markets } = useEntireMarkets();
  const isLpReady = useAppSelector(isLpReadySelector);

  const addresses = useMemo(() => {
    return markets?.map((market) => {
      return {
        marketAddress: market.address,
        tokenAddresses: market.tokenAddress,
      };
    });
  }, [markets]);

  const fetchKeyData = {
    name: 'getLiquidityPools',
    addresses,
  };
  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(
    isLpReady && checkAllProps(fetchKeyData) ? fetchKeyData : undefined,
    async ({ addresses }) => {
      const lensApi = client.lens();

      return PromiseOnlySuccess(
        addresses.map(({ marketAddress, tokenAddresses }) => {
          return getLiquidityPool(lensApi, marketAddress, tokenAddresses);
        })
      );
    },
    {
      dedupingInterval: 8000,
      keepPreviousData: true,
    }
  );

  useError({ error });

  return { liquidityPools, fetchLiquidityPools } as const;
};

export const useLiquidityPool = (marketAddress?: Address, tokenAddress?: Address) => {
  const dispatch = useAppDispatch();

  const { currentMarket } = useMarket();
  const { currentToken } = useSettlementToken();
  const currentMarketAddress = marketAddress || currentMarket?.address;
  const currentTokenAddress = tokenAddress || currentToken?.address;
  const isPositionsReady = useAppSelector(isPositionsReadySelector);
  const isLpReady = useAppSelector(isLpReadySelector);
  const previousMarketAddress = usePrevious(currentMarketAddress);
  const { isReady, client } = useChromaticClient();
  const location = useLocation();
  const isAssetReady = useMemo(() => {
    switch (location.pathname) {
      case '/trade': {
        return isPositionsReady;
      }
      case '/pool': {
        return isLpReady;
      }
    }
  }, [location.pathname, isLpReady, isPositionsReady]);

  const fetchKeyData = {
    name: 'useLiquidityPool',
    marketAddress: currentMarketAddress,
    tokenAddress: currentTokenAddress,
  };

  const {
    data: liquidityPool,
    mutate: fetchLiquidityPool,
    isLoading,
    error,
  } = useSWR(
    isAssetReady && isReady && checkAllProps(fetchKeyData) && fetchKeyData,
    async ({ marketAddress, tokenAddress }) => {
      const lensApi = client.lens();

      const pool = await getLiquidityPool(lensApi, marketAddress, tokenAddress);

      return pool;
    },
    { keepPreviousData: false, dedupingInterval: 8000 }
  );

  const [longTotalMaxLiquidity, longTotalUnusedLiquidity] = useMemo(() => {
    const longCLBTokens = (isNotNil(liquidityPool) ? liquidityPool.bins : []).filter(
      (bin) => bin.baseFeeRate > 0
    );
    return longCLBTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0] + currentToken.liquidity;
        const unused = acc[1] + currentToken.freeLiquidity;
        return [max, unused];
      },
      [0n, 0n]
    );
  }, [liquidityPool]);

  const [shortTotalMaxLiquidity, shortTotalUnusedLiquidity] = useMemo(() => {
    const shortCLBTokens = (isNotNil(liquidityPool) ? liquidityPool.bins : []).filter(
      (clbToken) => clbToken.baseFeeRate < 0
    );
    return shortCLBTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0] + currentToken.liquidity;
        const unused = acc[1] + currentToken.freeLiquidity;
        return [max, unused];
      },
      [0n, 0n]
    );
  }, [liquidityPool]);

  useEffect(() => {
    if (isNotNil(liquidityPool)) {
      dispatch(poolsAction.onPoolSelect(liquidityPool));
    }
  }, [liquidityPool]);

  useError({ error });

  return {
    liquidityPool,
    fetchLiquidityPool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
    isPoolLoading:
      isLoading ||
      isNil(currentTokenAddress) ||
      isNil(currentMarketAddress) ||
      previousMarketAddress !== currentMarketAddress,
  };
};

const baseFeeRates = [...FEE_RATES, ...FEE_RATES.map((rate) => rate * -1)];
const tokenIds = [
  ...FEE_RATES.map((rate) => encodeTokenId(rate)), // LONG COUNTER
  ...FEE_RATES.map((rate) => encodeTokenId(rate * -1)), // SHORT COUNTER
];
async function getLiquidityPool(
  lensApi: ChromaticLens,
  marketAddress: Address,
  tokenAddress: Address
) {
  const liquidityBinsPromise = lensApi.liquidityBins(marketAddress).then((bins) =>
    bins.reduce(
      (map, bin) => {
        map[bin.tradingFeeRate] = bin;
        return map;
      },
      {} as Record<
        number,
        {
          tradingFeeRate: number;
          clbValue: bigint;
          liquidity: bigint;
          clbTokenTotalSupply: bigint;
          freeLiquidity: bigint;
        }
      >
    )
  );

  const liquidityBins = await liquidityBinsPromise;
  const bins = tokenIds.map((tokenId, index) => {
    const bin = liquidityBins[baseFeeRates[index]];
    return {
      liquidity: bin.liquidity,
      clbTokenValue: bin.clbValue,
      freeLiquidity: bin.freeLiquidity,
      baseFeeRate: baseFeeRates[index],
      tokenId,
    } as Bin;
  });

  return {
    tokenAddress,
    marketAddress,
    bins,
  } satisfies LiquidityPool;
}
