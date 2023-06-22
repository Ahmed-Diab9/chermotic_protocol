import { CLBToken__factory } from "@chromatic-protocol/sdk/contracts";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAccount, useProvider, useSigner } from "wagmi";
import { BIN_VALUE_DECIMAL } from "~/configs/decimals";
import { MULTI_ALL, MULTI_TYPE } from "~/configs/pool";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { useAppDispatch, useAppSelector } from "../store";
import {
  Bin,
  CLBTokenBatch,
  LiquidityPool,
  LiquidityPoolSummary,
} from "../typings/pools";
import { errorLog, infoLog } from "../utils/log";
import { bigNumberify, expandDecimals } from "../utils/number";
import { isValid } from "../utils/valid";
import { useWalletBalances } from "./useBalances";
import { useChromaticClient } from "./useChromaticClient";
import useOracleVersion from "./useOracleVersion";
import usePoolReceipt from "./usePoolReceipt";
import { useSettlementToken } from "./useSettlementToken";
import { poolsAction } from "~/store/reducer/pools";
import { useMarket } from "./useMarket";

export const useLiquidityPool = () => {
  const { address: walletAddress } = useAccount();
  const provider = useProvider();
  const { tokens } = useSettlementToken();
  const { client } = useChromaticClient();
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
    infoLog("Fetching...");
    if (!isValid(oracleVersions)) {
      infoLog("OracleVersions");
      return;
    }
    if (!isValid(client)) {
      infoLog("Client");
      return;
    }
    if (!isValid(provider)) {
      infoLog("Provider");
      return;
    }
    const factory = client.marketFactory();
    const lens = client.lens();
      const precision = bigNumberify(10).pow(10);
      const baseFeeRates = [
        ...LONG_FEE_RATES,
        ...SHORT_FEE_RATES.map((rate) => rate * -1),
      ];
      const feeRates = [
        ...LONG_FEE_RATES.map((rate) => bigNumberify(rate)),
        ...SHORT_FEE_RATES.map((rate) => bigNumberify(rate).add(precision)),
      ];
      const promises = tokenAddresses.map(async (tokenAddress) => {
      const markets = await factory.getMarkets(tokenAddress);
      const promise = markets.map(async ({ address: marketAddress }) => {
        infoLog("MarketAddress", marketAddress);
        const market = client.market();
        infoLog("Market from Client");
        infoLog("Provider", provider);
        const clbTokenAddress = await market.contract.clbToken();
        infoLog("CLB Address", clbTokenAddress);
          const clbToken = CLBToken__factory.connect(clbTokenAddress, provider);
          const clbTokenBatch = new CLBTokenBatch(
            clbToken,
            lens,
            clbTokenAddress,
            tokenAddress,
          market.contract.address,
            baseFeeRates,
            feeRates
          );
        infoLog("CLB Address", clbTokenAddress);
          await clbTokenBatch.updateBalances(walletAddress);
          await clbTokenBatch.updateMetadata();
          await clbTokenBatch.updateLiquidities();
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
  });

  if (error) {
    errorLog(error);
  }

  return { liquidityPools, fetchLiquidityPools } as const;
};

export const useSelectedLiquidityPool = () => {
  const { client } = useChromaticClient();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const token = useAppSelector((state) => state.market.selectedToken);
  const [pools] = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const [_, fetchWalletBalances] = useWalletBalances();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const dispatch = useAppDispatch();

  const routerApi = useMemo(()=>client?.router(), [client]);

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

  // useEffect(() => {
  //   if (isValid(pool)) {
  //     dispatch(poolsAction.onPoolSelect(pool));
  //   }
  // }, [dispatch, pool]);

  const onRemoveLiquidity = useCallback(async (feeRate: number, amount: number) => {
    if (!isValid(signer) || !isValid(address)) {
      return;
    }
    if (!isValid(pool)) {
      return;
    }
    if (!isValid(routerApi)) {
      errorLog("no clients");
      return;
    }
    const routerAddress = routerApi.routerContract.address;

    const clbToken = CLBToken__factory.connect(pool.address, signer);
    const isApproved = await clbToken.isApprovedForAll(address, routerAddress);
    if (!isApproved) {
      infoLog("Approving all lp tokens");
      await clbToken.setApprovalForAll(routerAddress, true);
    }
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
  },[]);

  const onRemoveLiquidityBatch = useCallback(async (bins: Bin[], type: MULTI_TYPE) => {
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
      const { balance, binValue, freeLiquidity } = bin;
      const liquidityValue = balance
        .mul(binValue)
        .div(expandDecimals(BIN_VALUE_DECIMAL));
      const removable = liquidityValue.lt(freeLiquidity)
        ? liquidityValue
        : freeLiquidity;

      return type === MULTI_ALL ? balance : removable;
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
  },[]);

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
  // const [pools] = useLiquidityPool();
  // const { markets } = useMarket();
  // const { tokens } = useSettlementToken();

  // const poolSummary = useMemo(() => {
  //   if (!isValid(pools)) {
  //     return [];
  //   }
  //   const array = [] as LiquidityPoolSummary[];
  //   for (const pool of pools) {
  //     const { tokenAddress, marketAddress, bins } = pool;
  //     const market = markets?.find(
  //       (market) => market.address === marketAddress
  //     );
  //     const token = tokens?.find((token) => token.address === tokenAddress);
  //     if (!isValid(market) || !isValid(token)) {
  //       infoLog("token and market loading");
  //       return [];
  //     }
  //     const { description: marketDescription } = market;
  //     let liquiditySum = bigNumberify(0);
  //     let binSize = 0;
  //     for (let index = 0; index < bins.length; index++) {
  //       const bin = bins[index];
  //       if (bin.balance.gt(0)) {
  //         const addValue = bin.balance
  //           .mul(bin.binValue)
  //           .div(expandDecimals(BIN_VALUE_DECIMAL));
  //         binSize += 1;
  //         liquiditySum = liquiditySum.add(addValue);
  //       }
  //     }
  //     array.push({
  //       token: {
  //         name: token.name,
  //         decimals: token.decimals,
  //       },
  //       market: marketDescription,
  //       liquidity: liquiditySum,
  //       bins: binSize,
  //     });
  //   }
  //   return [array];
  // }, [pools, markets, tokens]);

  return [] as {
    token: any;
    market: any;
    liquidity: any;
    bins: any;
  }[];
};
