import {
  CLBToken,
  CLBToken__factory,
  ChromaticMarketFactory,
  ChromaticMarket__factory,
  ChromaticRouter,
  getDeployedContract,
} from "@chromatic-protocol/sdk";
import { BigNumber, ethers } from "ethers";
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAccount, useSigner } from "wagmi";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { BIN_VALUE_DECIMAL, TOKEN_URI_PREFIX } from "../configs/pool";
import { useAppDispatch } from "../store";
import { poolsAction } from "../store/reducer/pools";
import {
  LPTokenMetadata,
  LiquidityPool,
  LiquidityPoolSummary,
} from "../typings/pools";
import { errorLog, infoLog } from "../utils/log";
import { bigNumberify, expandDecimals } from "../utils/number";
import { isValid } from "../utils/valid";
import { useMarket, useSelectedMarket } from "./useMarket";
import { useSelectedToken, useSettlementToken } from "./useSettlementToken";
import usePoolReceipt from "./usePoolReceipt";
import { handleTx } from "~/utils/tx";
import { useWalletBalances } from "./useBalances";

const fetchLpTokenMetadata = async (
  lpToken: CLBToken,
  feeRates: BigNumber[]
) => {
  try {
    const promise = feeRates.map((rate) => {
      return lpToken.uri(rate);
    });
    const response = await Promise.allSettled(promise);
    const filtered = response.filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled"
    );

    return filtered.map(({ value }) => {
      const trimmed = window.atob(value.replace(TOKEN_URI_PREFIX, ""));
      const metadata: LPTokenMetadata = JSON.parse(trimmed);
      return metadata;
    });
  } catch (error) {
    errorLog(error);
    return undefined!;
  }
};

export const useLiquidityPool = () => {
  const { address: walletAddress } = useAccount();
  const [tokens] = useSettlementToken();
  const tokenAddresses = tokens?.map((token) => token.address);
  const fetchKey =
    isValid(walletAddress) && isValid(tokenAddresses)
      ? ([walletAddress, tokenAddresses] as const)
      : undefined;

  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(
    fetchKey,
    async ([walletAddress, tokenAddresses]) => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const factory = getDeployedContract(
        "ChromaticMarketFactory",
        "anvil",
        provider
      ) as ChromaticMarketFactory;
      const router = getDeployedContract(
        "ChromaticRouter",
        "anvil",
        provider
      ) as ChromaticRouter;
      const precision = bigNumberify(10).pow(10);
      const baseFeeRates = [
        ...SHORT_FEE_RATES.map((rate) => rate * -1),
        ...LONG_FEE_RATES,
      ];
      const feeRates = [
        ...SHORT_FEE_RATES.map((rate) => bigNumberify(rate).add(precision)),
        ...LONG_FEE_RATES.map((rate) => bigNumberify(rate)),
      ];
      const addresses = Array.from({ length: feeRates.length }).map(
        () => walletAddress
      );
      const promises = tokenAddresses.map(async (tokenAddress) => {
        const marketAddresses = await factory.getMarketsBySettlmentToken(
          tokenAddress
        );
        const promise = marketAddresses.map(async (marketAddress) => {
          const market = ChromaticMarket__factory.connect(
            marketAddress,
            provider
          );
          const lpTokenAddress = await market.clbToken();

          const lpToken = CLBToken__factory.connect(lpTokenAddress, provider);

          const balances = await lpToken.balanceOfBatch(addresses, feeRates);
          const metadata = await fetchLpTokenMetadata(lpToken, feeRates);

          const maxLiquidities = await market.getBinLiquidities(baseFeeRates);

          const unusedLiquidities = await market.getBinFreeLiquidities(
            baseFeeRates
          );
          const tokenValueBatch = await router.calculateCLBTokenValueBatch(
            marketAddress,
            baseFeeRates,
            maxLiquidities
          );

          // LP Token의 총 수량
          const totalSupplies = await router.totalSupplies(
            marketAddress,
            baseFeeRates
          );

          return {
            address: lpTokenAddress,
            tokenAddress,
            marketAddress: market.address,
            tokens: baseFeeRates.map((feeRate, feeRateIndex) => {
              const { name, description, image } = metadata[feeRateIndex];

              return {
                name,
                description,
                image,
                feeRate,
                balance: balances[feeRateIndex],
                binValue: tokenValueBatch[feeRateIndex],
                maxLiquidity: maxLiquidities[feeRateIndex],
                unusedLiquidity: unusedLiquidities[feeRateIndex],
              };
            }),
          } satisfies LiquidityPool;
        });
        const response = await Promise.allSettled(promise).catch((err) => {
          errorLog(err);
          return undefined!;
        });
        return response
          .filter((result): result is PromiseFulfilledResult<LiquidityPool> => {
            return result.status === "fulfilled";
          })
          .map(({ value }) => value);
      });

      const response = await Promise.allSettled(promises);
      return response
        .filter((result): result is PromiseFulfilledResult<LiquidityPool[]> => {
          return result.status === "fulfilled";
        })
        .map(({ value }) => value)
        .reduce((array, currentValue) => {
          array.push(...currentValue);
          return array;
        }, []);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) {
    errorLog(error);
  }

  return [liquidityPools, fetchLiquidityPools] as const;
};

export const useSelectedLiquidityPool = () => {
  const [market] = useSelectedMarket();
  const [token] = useSelectedToken();
  const [pools] = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const [_, fetchWalletBalances] = useWalletBalances();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const dispatch = useAppDispatch();

  const pool = useMemo(() => {
    if (!isValid(market) || !isValid(token) || !isValid(pools)) {
      return;
    }
    return pools.find(
      (pool) =>
        pool.tokenAddress === token.address &&
        pool.marketAddress === market.address
    );
  }, [market, token, pools]);

  const [longTotalMaxLiquidity, longTotalUnusedLiquidity] = useMemo(() => {
    const longLpTokens = (pool?.tokens ?? []).filter(
      (lpToken) => lpToken.feeRate > 0
    );
    return longLpTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0].add(currentToken.maxLiquidity);
        const unused = acc[1].add(currentToken.unusedLiquidity);
        return [max, unused];
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);
  const [shortTotalMaxLiquidity, shortTotalUnusedLiquidity] = useMemo(() => {
    const shortLpTokens = (pool?.tokens ?? []).filter(
      (lpToken) => lpToken.feeRate < 0
    );
    return shortLpTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0].add(currentToken.maxLiquidity);
        const unused = acc[1].add(currentToken.unusedLiquidity);
        return [max, unused];
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);

  useEffect(() => {
    if (isValid(pool)) {
      dispatch(poolsAction.onPoolSelect(pool));
    }
  }, [dispatch, pool]);

  const onRemoveLiquidity = async (feeRate: number, amount: number) => {
    if (!isValid(signer) || !isValid(address)) {
      return;
    }
    if (!isValid(pool)) {
      return;
    }

    const router = getDeployedContract(
      "ChromaticRouter",
      "anvil",
      signer
    ) as ChromaticRouter;

    const lpToken = CLBToken__factory.connect(pool.address, signer);
    const isApproved = await lpToken.isApprovedForAll(address, router.address);
    if (!isApproved) {
      infoLog("Approving all lp tokens");
      await lpToken.setApprovalForAll(router.address, true);
    }
    const expandedAmount = bigNumberify(amount).mul(
      expandDecimals(token?.decimals ?? 1)
    );

    const tx = await router.removeLiquidity(
      pool.marketAddress,
      feeRate,
      expandedAmount,
      address
    );

    handleTx(tx, fetchReceipts, fetchWalletBalances);
  };

  return [
    pool,
    [
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    ],
    onRemoveLiquidity,
  ] as const;
};

export const useLiquidityPoolSummary = () => {
  const [pools] = useLiquidityPool();
  const [markets] = useMarket();
  const [tokens] = useSettlementToken();

  const poolSummary = useMemo(() => {
    if (!isValid(pools)) {
      return [];
    }
    const array = [] as LiquidityPoolSummary[];
    for (const pool of pools) {
      const { tokenAddress, marketAddress, tokens: lpTokens } = pool;
      const market = markets?.find(
        (market) => market.address === marketAddress
      );
      const token = tokens?.find((token) => token.address === tokenAddress);
      if (!isValid(market) || !isValid(token)) {
        infoLog("token and market loading");
        return [];
      }
      const { description: marketDescription } = market;
      let liquiditySum = bigNumberify(0);
      let bins = 0;
      for (let index = 0; index < lpTokens.length; index++) {
        const lpToken = lpTokens[index];
        if (lpToken.balance.gt(0)) {
          const addValue = lpToken.balance
            .mul(lpToken.binValue)
            .div(expandDecimals(BIN_VALUE_DECIMAL));
          bins += 1;
          liquiditySum = liquiditySum.add(addValue);
        }
      }
      array.push({
        token: {
          name: token.name,
          decimals: token.decimals,
        },
        market: marketDescription,
        liquidity: liquiditySum,
        bins,
      });
    }
    return array;
  }, [pools, markets, tokens]);

  return poolSummary;
};
