import {
  CLBToken__factory,
  ChromaticLens,
  ChromaticMarketFactory,
  ChromaticMarket__factory,
  ChromaticRouter,
  getDeployedContract,
} from "@chromatic-protocol/sdk";
import { ethers } from "ethers";
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAccount, useSigner } from "wagmi";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { useAppDispatch } from "../store";
import { poolsAction } from "../store/reducer/pools";
import {
  CLBTokenBatch,
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
import { BIN_VALUE_DECIMAL } from "~/configs/decimals";
import useOracleVersion from "./useOracleVersion";

export const useLiquidityPool = () => {
  const { address: walletAddress } = useAccount();
  const [tokens] = useSettlementToken();
  const tokenAddresses = tokens?.map((token) => token.address);
  const { oracleVersions } = useOracleVersion();
  const fetchKey =
    isValid(walletAddress) && isValid(tokenAddresses) && isValid(oracleVersions)
      ? ([walletAddress, tokenAddresses, oracleVersions] as const)
      : undefined;

  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(
    fetchKey,
    async ([walletAddress, tokenAddresses, oracleVersions]) => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const factory = getDeployedContract(
        "ChromaticMarketFactory",
        "anvil",
        provider
      ) as ChromaticMarketFactory;
      const lens = getDeployedContract(
        "ChromaticLens",
        "anvil",
        provider
      ) as ChromaticLens;
      const precision = bigNumberify(10).pow(10);
      const baseFeeRates = [
        ...SHORT_FEE_RATES.map((rate) => rate * -1),
        ...LONG_FEE_RATES,
      ];
      const feeRates = [
        ...SHORT_FEE_RATES.map((rate) => bigNumberify(rate).add(precision)),
        ...LONG_FEE_RATES.map((rate) => bigNumberify(rate)),
      ];
      const promises = tokenAddresses.map(async (tokenAddress) => {
        const marketAddresses = await factory.getMarketsBySettlmentToken(
          tokenAddress
        );
        const promise = marketAddresses.map(async (marketAddress) => {
          const market = ChromaticMarket__factory.connect(
            marketAddress,
            provider
          );
          const version = oracleVersions[marketAddress].version;
          const clbTokenAddress = await market.clbToken();
          const clbToken = CLBToken__factory.connect(clbTokenAddress, provider);
          const clbTokenBatch = new CLBTokenBatch(
            clbToken,
            lens,
            clbTokenAddress,
            tokenAddress,
            market.address,
            baseFeeRates,
            feeRates
          );
          await clbTokenBatch.updateBalances(walletAddress);
          await clbTokenBatch.updateMetadata();
          await clbTokenBatch.updateLiquidities(version);
          await clbTokenBatch.updateBinValues();
          clbTokenBatch.updateLiquidityValues();
          clbTokenBatch.updateRemovableRates();

          return {
            address: clbTokenAddress,
            tokenAddress,
            marketAddress,
            bins: clbTokenBatch.toBins(),
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
