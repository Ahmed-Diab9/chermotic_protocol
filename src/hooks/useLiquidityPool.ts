import { CLBToken__factory } from "@chromatic-protocol/sdk/contracts";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAccount, useProvider, useSigner } from "wagmi";
import { BIN_VALUE_DECIMAL } from "~/configs/decimals";
import { MULTI_ALL, MULTI_TYPE } from "~/configs/pool";
import { FEE_RATES } from "../configs/feeRate";
import { useAppDispatch, useAppSelector } from "../store";
import { Bin, LiquidityPool, LiquidityPoolSummary } from "../typings/pools";
import { bigNumberify, expandDecimals } from "../utils/number";
import { isValid } from "../utils/valid";
import { useWalletBalances } from "./useBalances";
import { useChromaticClient } from "./useChromaticClient";
import useOracleVersion from "./useOracleVersion";
import usePoolReceipt from "./usePoolReceipt";
import { useSettlementToken } from "./useSettlementToken";
import { poolsAction } from "~/store/reducer/pools";
import { useMarket } from "./useMarket";
import { Logger } from "../utils/log";
import { filterIfFulfilled } from "~/utils/array";
const logger = Logger("useLiquidityPool.ts");

export const useLiquidityPool = () => {
  const { address: walletAddress } = useAccount();
  const provider = useProvider();
  const { tokens } = useSettlementToken();
  const { client } = useChromaticClient();
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const tokenAddresses = tokens?.map((token) => token.address);
  const { oracleVersions } = useOracleVersion();

  const fetchKey =
    isValid(walletAddress) && isValid(tokenAddresses)
      ? (["LIQUIDITY_POOL", walletAddress, tokenAddresses] as const)
      : undefined;

  const {
    data: liquidityPools,
    error,
    mutate: fetchLiquidityPools,
  } = useSWR(fetchKey, async ([_, walletAddress, tokenAddresses]) => {
    if (!isValid(oracleVersions)) {
      logger.info("OracleVersions");
      return;
    }
    if (!isValid(client)) {
      logger.info("Client");
      return;
    }
    if (!isValid(provider)) {
      logger.info("Provider");
      return;
    }
    const factory = client.marketFactory();
    const precision = bigNumberify(10).pow(10);
    const baseFeeRates = [...FEE_RATES, ...FEE_RATES.map((rate) => rate * -1)];
    const feeRates = [
      ...FEE_RATES.map((rate) => bigNumberify(rate)),
      ...FEE_RATES.map((rate) => bigNumberify(rate).add(precision)),
    ];
    const promises = tokenAddresses.map(async (tokenAddress) => {
      const markets = await factory.getMarkets(tokenAddress);
      const promise = markets.map(async ({ address: marketAddress }) => {
        logger.log("MarketAddress", marketAddress);
        const market = client.market();
        const lensApi = client.lens();
        const clbTokenAddress = await market
          .getContract(marketAddress)
          .clbToken();
        const clbToken = CLBToken__factory.connect(clbTokenAddress, provider);
        const results = await lensApi.liquidityBins(marketAddress);
        const ownedBins = await lensApi.ownedLiquidityBins(
          marketAddress,
          walletAddress
        );
        logger.log("ownedBins", ownedBins);

        const binsResponse = results.map(async (result, index) => {
          return {
            liquidity: result.liquidity,
            freeLiquidity: result.freeLiquidity,
            clbTokenName: await clbToken.name(feeRates[index]),
            clbTokenImage: await clbToken.image(feeRates[index]),
            clbTokenDescription: await clbToken.description(feeRates[index]),
            clbTokenDecimals: await clbToken.decimals(),
            clbTokenBalance: bigNumberify(0),
            clbTokenValue: 0,
            binValue: bigNumberify(0),
            removableRate: 0,
            baseFeeRate: baseFeeRates[index],
            feeRate: feeRates[index],
          } as Bin;
        });
        const bins = await filterIfFulfilled(binsResponse);

        let binIndex = 0;
        let ownedBinIndex = 0;
        while (ownedBinIndex < ownedBins.length) {
          console.log("Rolling", ownedBinIndex);
          if (
            bins[binIndex].baseFeeRate !==
            ownedBins[ownedBinIndex].tradingFeeRate
          ) {
            binIndex++;
            continue;
          }
          bins[binIndex].removableRate = ownedBins[ownedBinIndex].removableRate;
          bins[binIndex].clbTokenBalance = ownedBins[ownedBinIndex].clbBalance;
          bins[binIndex].clbTokenValue = ownedBins[ownedBinIndex].clbValue;
          bins[binIndex].binValue = ownedBins[binIndex].clbBalance.mul(
            ownedBins[ownedBinIndex].clbValue
          );
          binIndex++;
          ownedBinIndex++;
        }
        return {
          address: clbTokenAddress,
          tokenAddress,
          marketAddress,
          bins: bins as Bin[],
        } satisfies LiquidityPool;
      });
      const response = await Promise.allSettled(promise).catch((err) => {
        logger.error(err);
        return undefined!;
      });
      return response
        .filter((result): result is PromiseFulfilledResult<LiquidityPool> => {
          return result.status === "fulfilled" && result.value !== undefined;
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
  });

  if (error) {
    logger.error(error);
  }

  return { liquidityPools, fetchLiquidityPools } as const;
};

export const useSelectedLiquidityPool = () => {
  const { client } = useChromaticClient();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const token = useAppSelector((state) => state.token.selectedToken);
  const { liquidityPools: pools } = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchWalletBalances } = useWalletBalances();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const dispatch = useAppDispatch();

  const routerApi = useMemo(() => client?.router(), [client]);

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
    const longCLBTokens = (isValid(pool) ? pool.bins : []).filter(
      (bin) => bin.baseFeeRate > 0
    );
    return longCLBTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0].add(currentToken.liquidity);
        const unused = acc[1].add(currentToken.freeLiquidity);
        return [max, unused];
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);
  const [shortTotalMaxLiquidity, shortTotalUnusedLiquidity] = useMemo(() => {
    const shortCLBTokens = (isValid(pool) ? pool.bins : []).filter(
      (clbToken) => clbToken.baseFeeRate < 0
    );
    return shortCLBTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0].add(currentToken.liquidity);
        const unused = acc[1].add(currentToken.freeLiquidity);
        return [max, unused];
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);

  useEffect(() => {
    if (isValid(pool)) {
      dispatch(poolsAction.onPoolSelect(pool));
    }
  }, [pool]);

  const onRemoveLiquidity = useCallback(
    async (feeRate: number, amount: number) => {
      if (!isValid(signer) || !isValid(address)) {
        logger.info("no signer or address", signer, address);
        return;
      }
      if (!isValid(pool)) {
        logger.info("no pool");
        return;
      }
      if (!isValid(routerApi)) {
        logger.info("no clients");
        return;
      }
      const routerAddress = routerApi.routerContract.address;

      // const clbToken = CLBToken__factory.connect(pool.address, signer);
      // const isApproved = await clbToken.isApprovedForAll(
      //   address,
      //   routerAddress
      // );
      // if (!isApproved) {
      //   logger.info("Approving all lp tokens");
      //   await clbToken.setApprovalForAll(routerAddress, true);
      // }
      const expandedAmount = bigNumberify(amount).mul(
        expandDecimals(token?.decimals ?? 1)
      );

      await routerApi.removeLiquidity(pool.marketAddress, {
        feeRate,
        receipient: address,
        clbTokenAmount: expandedAmount,
      });
      await fetchReceipts();
      await fetchWalletBalances();
    },
    [signer, address, pool, routerApi]
  );

  const onRemoveLiquidityBatch = useCallback(
    async (bins: Bin[], type: MULTI_TYPE) => {
      if (!isValid(signer) || !isValid(address) || !isValid(market)) {
        return;
      }
      if (!isValid(pool)) {
        return;
      }
      if (!isValid(routerApi)) {
        return;
      }
      const amounts = bins.map((bin) => {
        const { clbTokenBalance, clbTokenValue, freeLiquidity } = bin;
        const liquidityValue = clbTokenBalance
          .mul(clbTokenValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        const removable = liquidityValue.lt(freeLiquidity)
          ? liquidityValue
          : freeLiquidity;

        return type === MULTI_ALL ? clbTokenBalance : removable;
      });
      await routerApi.removeLiquidities(
        market.address,
        bins.map((bin, binIndex) => ({
          feeRate: bin.baseFeeRate,
          clbTokenAmount: amounts[binIndex],
          receipient: address,
        }))
      );
      await fetchReceipts();
      await fetchWalletBalances();
    },
    [signer, market, pool, routerApi]
  );

  return {
    pool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
    onRemoveLiquidity,
    onRemoveLiquidityBatch,
  };
};

export const useLiquidityPoolSummary = () => {
  const { liquidityPools: pools } = useLiquidityPool();
  const { markets } = useMarket();
  const { tokens } = useSettlementToken();

  const poolSummary = useMemo(() => {
    logger.log("useLIquidityPoolSummary", pools);
    if (!isValid(pools)) {
      return [];
    }
    const array = [] as LiquidityPoolSummary[];
    for (const pool of pools) {
      if (!pool) continue;
      const { tokenAddress, marketAddress, bins } = pool;
      const market = markets?.find(
        (market) => market.address === marketAddress
      );
      const token = tokens?.find((token) => token.address === tokenAddress);
      if (!isValid(market) || !isValid(token)) {
        logger.info("token and market loading");
        return [];
      }
      const { description: marketDescription } = market;
      let liquiditySum = bigNumberify(0);
      const myBins = bins.filter((bin) => bin.clbTokenBalance.gt(0));
      logger.log("myBins", myBins);
      for (let index = 0; index < myBins.length; index++) {
        const bin = bins[index];
        const addValue = bin.clbTokenBalance
          .mul(bin.binValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        liquiditySum = liquiditySum.add(addValue);
      }
      array.push({
        token: {
          name: token.name,
          decimals: token.decimals,
        },
        market: marketDescription,
        liquidity: liquiditySum,
        bins: myBins.length,
      });
    }
    return array;
  }, [pools, markets, tokens]);

  return poolSummary;
};
