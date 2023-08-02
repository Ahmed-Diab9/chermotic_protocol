import type { ChromaticLens, ChromaticMarket } from '@chromatic-protocol/sdk-viem';
import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import { isNotNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { poolsAction } from '~/store/reducer/pools';
import { FEE_RATES } from '../configs/feeRate';
import { useAppDispatch } from '../store';
import { Bin, LiquidityPool } from '../typings/pools';
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';
import { isValid } from '../utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

const { encodeTokenId } = ChromaticUtils;

export const useLiquidityPools = () => {
  const { client } = useChromaticClient();
  const { tokens } = useSettlementToken();

  const tokenAddresses = useMemo(() => tokens?.map((token) => token.address), [tokens]);

  const fetchKeyData = {
    name: 'getLiquidityPools',
    tokenAddresses,
  };
  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(checkAllProps(fetchKeyData) && fetchKeyData, async ({ tokenAddresses }) => {
    const lensApi = client.lens();
    const marketFactoryApi = client.marketFactory();
    const marketApi = client.market();

    const marketAddresses = (
      await PromiseOnlySuccess(
        tokenAddresses.map(async (tokenAddress) => ({
          tokenAddress,
          marketAddresses: await marketFactoryApi
            .contracts()
            .marketFactory.read.getMarketsBySettlmentToken([tokenAddress]),
        }))
      )
    ).reduce((map, row) => {
      row.marketAddresses.forEach((marketAddress) => (map[marketAddress] = row.tokenAddress));
      return map;
    }, {} as Record<Address, Address>);

    const promise = Object.keys(marketAddresses).map(async (address) => {
      return getLiquidityPool(marketApi, lensApi, address as Address);
    });

    return PromiseOnlySuccess(promise);
  });

  useError({ error });

  return { liquidityPools, fetchLiquidityPools } as const;
};

export const useLiquidityPool = (marketAddress?: Address) => {
  const dispatch = useAppDispatch();

  const { currentMarket } = useMarket();
  const currentMarketAddress = marketAddress || currentMarket?.address;

  const { isReady, client } = useChromaticClient();

  const fetchKeyData = {
    name: 'useLiquidityPool',
    marketAddress: currentMarketAddress,
  };

  const { data: liquidityPool, mutate: fetchLiquidityPool } = useSWR(
    isReady && checkAllProps(fetchKeyData) && fetchKeyData,
    async ({ marketAddress }) => {
      const lensApi = client.lens();
      const marketApi = client.market();

      return getLiquidityPool(marketApi, lensApi, marketAddress);
    },
    { keepPreviousData: false }
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
    if (isValid(liquidityPool)) {
      dispatch(poolsAction.onPoolSelect(liquidityPool));
    }
  }, [liquidityPool]);

  return {
    liquidityPool,
    fetchLiquidityPool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  };
};

const baseFeeRates = [...FEE_RATES, ...FEE_RATES.map((rate) => rate * -1)];
const tokenIds = [
  ...FEE_RATES.map((rate) => encodeTokenId(rate)), // LONG COUNTER
  ...FEE_RATES.map((rate) => encodeTokenId(rate * -1)), // SHORT COUNTER
];
async function getLiquidityPool(
  marketApi: ChromaticMarket,
  lensApi: ChromaticLens,
  marketAddress: Address
) {
  const tokenAddress = await marketApi.settlementToken(marketAddress);
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

  const clbTokenMetas = await PromiseOnlySuccess(
    tokenIds.map(async (tokenId, index) => ({
      tokenId,
      baseFeeRate: baseFeeRates[index],
      ...(await marketApi.clbTokenMeta(marketAddress, tokenId)),
    }))
  );

  const liquidityBins = await liquidityBinsPromise;
  const bins = clbTokenMetas.map(({ tokenId, baseFeeRate, name, description, decimals, image }) => {
    const bin = liquidityBins[baseFeeRate];
    return {
      liquidity: bin.liquidity,
      clbTokenValue: bin.clbValue,
      freeLiquidity: bin.freeLiquidity,
      clbTokenName: name,
      clbTokenImage: image,
      clbTokenDescription: description,
      clbTokenDecimals: decimals,
      baseFeeRate,
      tokenId,
    } satisfies Bin;
  });

  return {
    tokenAddress,
    marketAddress,
    bins,
  } satisfies LiquidityPool;
}
