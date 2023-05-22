import {
  USUMMarketFactory,
  USUMMarket__factory,
  getDeployedContract,
} from "@quarkonix/usum";
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { bigNumberify } from "../utils/number";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { useSelectedToken, useSettlementToken } from "./useSettlementToken";
import { LPToken } from "../typings/pools";
import { useSelectedMarket } from "./useMarket";
import { useAppDispatch } from "../store";
import { poolsAction } from "../store/reducer/pools";
import { ethers } from "ethers";

export const useLpToken = () => {
  const { address: walletAddress } = useAccount();
  const [tokens] = useSettlementToken();
  const tokenAddresses = tokens?.map((token) => token.address);
  const fetchKey =
    isValid(walletAddress) && isValid(tokenAddresses)
      ? ([walletAddress, tokenAddresses] as const)
      : undefined;

  const {
    data: lpTokens,
    error,
    mutate: fetchLpTokens,
  } = useSWR(fetchKey, async ([walletAddress, tokenAddresses]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const factory = getDeployedContract(
      "USUMMarketFactory",
      "anvil",
      provider
    ) as USUMMarketFactory;
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
        const market = USUMMarket__factory.connect(marketAddress, provider);
        const balances = await market.balanceOfBatch(addresses, feeRates);

        const maxLiquidities = await market.getSlotMarginsUnused(baseFeeRates);
        const unusedLiquidities = await market.getSlotMarginsUnused(
          baseFeeRates
        );

        return {
          tokenAddress,
          marketAddress: market.address,
          slots: baseFeeRates.map((feeRate, feeRateIndex) => ({
            feeRate,
            balance: balances[feeRateIndex],
            maxLiquidity: maxLiquidities[feeRateIndex],
            unusedLiquidity: unusedLiquidities[feeRateIndex],
          })),
        } satisfies LPToken;
      });
      const response = await Promise.allSettled(promise);
      return response
        .filter((result): result is PromiseFulfilledResult<LPToken> => {
          return result.status === "fulfilled";
        })
        .map(({ value }) => value);
    });

    const response = await Promise.allSettled(promises);
    return response
      .filter((result): result is PromiseFulfilledResult<LPToken[]> => {
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

  return [lpTokens, fetchLpTokens] as const;
};

export const useSelectedLpTokens = () => {
  const [market] = useSelectedMarket();
  const [token] = useSelectedToken();
  const [lpTokens] = useLpToken();
  const dispatch = useAppDispatch();

  const lpToken = useMemo(() => {
    if (!isValid(market) || !isValid(token) || !isValid(lpTokens)) {
      return;
    }
    return lpTokens.find(
      (lpToken) =>
        lpToken.tokenAddress === token.address &&
        lpToken.marketAddress === market.address
    );
  }, [market, token, lpTokens]);

  const totalMaxLiquidity = useMemo(() => {
    if (!isValid(lpToken)) {
      return;
    }
    return lpToken.slots.reduce(
      (acc, currentValue) => acc.add(currentValue.maxLiquidity),
      bigNumberify(0)
    );
  }, [lpToken]);

  const totalUnusedLiquidity = useMemo(() => {
    if (!isValid(lpToken)) {
      return;
    }
    return lpToken.slots.reduce(
      (acc, currentValue) => acc.add(currentValue.unusedLiquidity),
      bigNumberify(0)
    );
  }, [lpToken]);

  useEffect(() => {
    if (isValid(lpToken)) {
      dispatch(poolsAction.onLpTokenSelect(lpToken));
    }
  }, [dispatch, lpToken]);

  useEffect(() => {
    dispatch(
      poolsAction.onTotalLiquidityChange({
        totalMax: totalMaxLiquidity,
        totalUnused: totalUnusedLiquidity,
      })
    );
  }, [dispatch, totalMaxLiquidity, totalUnusedLiquidity]);

  return [lpToken, totalMaxLiquidity, totalUnusedLiquidity] as const;
};
