import type { ChromaticLens, ChromaticMarket } from '@chromatic-protocol/sdk-viem';
import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import memoizeOne from 'memoize-one';
import { isNotNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { poolsAction } from '~/store/reducer/pools';
import { FEE_RATES } from '../configs/feeRate';
import { useAppDispatch, useAppSelector } from '../store';
import { Bin, LiquidityPool, LiquidityPoolSummary } from '../typings/pools';
import { Logger } from '../utils/log';
import { PromiseOnlySuccess } from '../utils/promise';
import { isValid } from '../utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';
import { useOwnedLiquidityPools } from './useOwnedLiquidityPools';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('useLiquidityPool.ts');
const { encodeTokenId } = ChromaticUtils;

export const useLiquidityPools = () => {
  const { client } = useChromaticClient();

  const { tokens } = useSettlementToken();
  const marketApi = useMemo(() => client?.market(), [client]);
  const lensApi = useMemo(() => client?.lens(), [client]);
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);
  const tokenAddresses = useMemo(() => tokens?.map((token) => token.address), [tokens]);

  const fetchKey = useMemo(
    () =>
      isNotNil(tokenAddresses) &&
      isNotNil(marketFactoryApi) &&
      isNotNil(lensApi) &&
      isNotNil(marketApi)
        ? ([tokenAddresses, marketFactoryApi, lensApi, marketApi] as const)
        : null,
    [tokenAddresses, marketFactoryApi, lensApi, marketApi]
  );
  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(fetchKey, async ([tokenAddresses, marketFactoryApi, lensApi, marketApi]) => {
    logger.log('FETCH POOLS');

    const marketAddresses = (
      await PromiseOnlySuccess(
        tokenAddresses.map(async (tokenAddress) => ({
          tokenAddress,
          marketAddresses: await marketFactoryApi!
            .contracts()
            .marketFactory.read.getMarketsBySettlmentToken([tokenAddress]),
        }))
      )
    ).reduce((map, row) => {
      row.marketAddresses.forEach((marketAddress) => (map[marketAddress] = row.tokenAddress));
      return map;
    }, {} as Record<Address, Address>);

    const promise = Object.keys(marketAddresses).map(async (ma) => {
      return getLiquidityPool(marketApi, lensApi, ma as Address);
    });

    return PromiseOnlySuccess(promise);
  });

  useError({ error });

  return { liquidityPools, fetchLiquidityPools } as const;
};

export const useLiquidityPool = (marketAddress?: Address) => {
  const market = useAppSelector((state) => state.market.selectedMarket);
  const currentMarketAddress = marketAddress || market?.address;
  const dispatch = useAppDispatch();

  const { client } = useChromaticClient();
  const lensApi = useMemo(() => client?.lens(), [client]);
  const marketApi = useMemo(() => client?.market(), [client]);
  const { data: liquidityPool } = useSWR(
    isNotNil(marketApi) && isNotNil(lensApi) && isNotNil(currentMarketAddress)
      ? [lensApi, marketApi, currentMarketAddress]
      : null,
    async ([lensApi, marketApi, marketAddress]) => {
      return getLiquidityPool(marketApi, lensApi, marketAddress);
    }
  );

  const [longTotalMaxLiquidity, longTotalUnusedLiquidity] = useMemo(() => {
    const longCLBTokens = (isValid(liquidityPool) ? liquidityPool.bins : []).filter(
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
    const shortCLBTokens = (isValid(liquidityPool) ? liquidityPool.bins : []).filter(
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
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  };
};

export const useLiquidityPoolSummary = () => {
  const { ownedPools: pools } = useOwnedLiquidityPools();
  const { markets } = useMarket();
  const { tokens } = useSettlementToken();
  const token = useAppSelector((state) => state.token.selectedToken);
  const logger = Logger(useLiquidityPoolSummary);
  const poolSummary = useMemo(() => {
    logger.log('pools', pools);
    if (!isValid(pools) || !isValid(token)) {
      return [];
    }
    const array = [] as LiquidityPoolSummary[];
    for (const market of markets ?? []) {
      const marketAddress = market.address;
      const bins = pools[marketAddress] || [];
      logger.info('bins', bins);
      const { description: marketDescription } = market;
      let liquiditySum = 0n;

      for (let index = 0; index < bins.length; index++) {
        const bin = bins[index];
        liquiditySum = liquiditySum + bin.binValue;
      }
      array.push({
        token: {
          name: token.name,
          decimals: token.decimals,
        },
        market: marketDescription,
        liquidity: liquiditySum,
        bins: bins.length,
      });
    }
    return array;
  }, [pools, markets, tokens]);
  return poolSummary;
};

const baseFeeRates = [...FEE_RATES, ...FEE_RATES.map((rate) => rate * -1)];
const tokenIds = [
  ...FEE_RATES.map((rate) => encodeTokenId(rate)), // LONG COUNTER
  ...FEE_RATES.map((rate) => encodeTokenId(rate, false)), // SHORT COUNTER
];
async function getLiquidityPool(
  marketApi: ChromaticMarket,
  lensApi: ChromaticLens,
  marketAddress: Address
) {
  const tokenAddress = await marketApi.settlementToken(marketAddress);
  const liquidityBinsPromise = lensApi!.liquidityBins(marketAddress).then((bins) =>
    bins.reduce(
      (map, bin) => {
        map[bin.tradingFeeRate] = bin;
        return map;
      },
      {} as Record<
        number,
        {
          tradingFeeRate: number;
          clbValue: number;
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
