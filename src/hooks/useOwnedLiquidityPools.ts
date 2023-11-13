import {
  ChromaticLens,
  ChromaticMarket,
  utils as ChromaticUtils,
} from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { LiquidityPoolSummary, OwnedBin } from '~/typings/pools';
import { trimMarkets } from '~/utils/market';
import { checkAllProps } from '../utils';
import { divPreserved, mulPreserved } from '../utils/number';
import { PromiseOnlySuccess, promiseSlowLoop } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useEntireMarkets, useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

const { encodeTokenId } = ChromaticUtils;

async function getLiquidityPool(
  lensApi: ChromaticLens,
  marketApi: ChromaticMarket,
  address: Address,
  marketAddress: Address,
  tokenAddress: Address
) {
  const bins = await lensApi.ownedLiquidityBins(marketAddress, address);
  const detailedBins = await promiseSlowLoop(
    bins,
    async (bin) => {
      const tokenId = encodeTokenId(Number(bin.tradingFeeRate));
      const { name, decimals, description, image } = await marketApi.clbTokenMeta(
        marketAddress,
        tokenId
      );
      return {
        liquidity: bin.liquidity,
        freeLiquidity: bin.freeLiquidity,
        removableRate: divPreserved(bin.freeLiquidity, bin.liquidity, decimals),
        clbTokenName: name,
        clbTokenImage: image,
        clbTokenDescription: description,
        clbTokenDecimals: decimals,
        clbTokenBalance: bin.clbBalance,
        clbTokenValue: bin.clbValue,
        clbTotalSupply: bin.clbTotalSupply,
        binValue: bin.binValue,
        clbBalanceOfSettlement: mulPreserved(bin.clbBalance, bin.clbValue, decimals),
        baseFeeRate: bin.tradingFeeRate,
        tokenId: tokenId,
      } satisfies OwnedBin;
    },
    {
      interval: 400,
    }
  );
  return { tokenAddress, marketAddress, bins: detailedBins };
}

export const useOwnedLiquidityPools = () => {
  const { client, walletAddress } = useChromaticClient();
  const { tokens, currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { markets } = useEntireMarkets();

  const fetchKey = {
    name: 'getOwnedPools',
    type: 'EOA',
    address: walletAddress,
    tokens,
    markets: trimMarkets(markets),
  };

  const {
    data: ownedPools,
    error,
    mutate: fetchOwnedPools,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : null, async ({ address, tokens, markets }) => {
    const lensApi = client.lens();
    const marketApi = client.market();

    const poolsResponse = await PromiseOnlySuccess(
      markets.map(async (market) => {
        const token = tokens.find((token) => token.address === market.tokenAddress);
        if (isNil(token)) {
          throw new Error('Tokens not found.');
        }
        return getLiquidityPool(lensApi, marketApi, address, market.address, token.address);
      })
    );
    return poolsResponse;
  });

  function fetchCurrentOwnedPool() {
    fetchOwnedPools<{ tokenAddress: Address; marketAddress: Address; bins: OwnedBin[] }[]>(
      async (ownedPools) => {
        if (
          isNil(ownedPools) ||
          isNil(walletAddress) ||
          isNil(currentMarket) ||
          isNil(currentToken)
        )
          return ownedPools;

        const filteredPoolData = ownedPools?.filter(
          (pool) => pool.marketAddress !== currentMarket?.address
        );

        const lensApi = client.lens();
        const marketApi = client.market();

        const newPoolData = await getLiquidityPool(
          lensApi,
          marketApi,
          walletAddress,
          currentMarket.address,
          currentToken.address
        );
        return [...filteredPoolData, newPoolData];
      }
    );
  }

  const currentOwnedPool = ownedPools?.find(
    ({ marketAddress }) => marketAddress === currentMarket?.address
  );

  const ownedPoolSummary = useMemo(() => {
    if (isNil(ownedPools) || isNil(tokens) || isNil(markets)) return [];

    const array: (LiquidityPoolSummary | undefined)[] = markets.map((market) => {
      const { description: marketDescription, image: marketImage } = market;
      const token = tokens.find((token) => token.address === market.tokenAddress);
      const pool = ownedPools.find((pool) => pool.marketAddress === market.address);
      if (isNil(token)) {
        return undefined;
      }
      if (isNil(pool)) {
        return {
          token: {
            name: token.name,
            decimals: token.decimals,
          },
          market: marketDescription,
          image: marketImage,
          liquidity: 0n,
          bins: 0,
        };
      }

      const liquiditySum = pool.bins.reduce((total, bin) => total + bin.clbBalanceOfSettlement, 0n);

      return {
        token: {
          name: token.name,
          decimals: token.decimals,
        },
        market: marketDescription,
        image: marketImage,
        liquidity: liquiditySum,
        bins: pool.bins.length,
      };
    });

    return array.filter((summaryInfo): summaryInfo is LiquidityPoolSummary =>
      isNotNil(summaryInfo)
    );
  }, [ownedPools, tokens, markets]);

  useError({ error });

  return {
    ownedPools,
    currentOwnedPool,
    fetchOwnedPools,
    fetchCurrentOwnedPool,
    ownedPoolSummary,
  };
};
