import {
  USUMMarketFactory,
  USUMMarket__factory,
  getDeployedContract,
} from "@quarkonix/usum";
import { useMemo } from "react";
import useSWR from "swr";
import { useAccount, useSigner } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { bigNumberify } from "../utils/number";
import { FEE_RATES } from "../configs/feeRate";
import { useSettlementToken } from "./useSettlementToken";
import { LPToken, LPTokenSlot } from "../typings/pools";

const useLpToken = () => {
  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();
  const [tokens] = useSettlementToken();
  const factory = useMemo(() => {
    if (isValid(signer)) {
      return getDeployedContract(
        "USUMMarketFactory",
        "anvil",
        signer
      ) as USUMMarketFactory;
    }
  }, [signer]);
  const fetchKey =
    isValid(factory) &&
    isValid(walletAddress) &&
    isValid(tokens) &&
    isValid(signer)
      ? ([factory, walletAddress, tokens, signer] as const)
      : undefined;

  const {
    data: lpTokens,
    error,
    mutate: fetchLpTokens,
  } = useSWR(fetchKey, async ([factory, walletAddress, tokens, signer]) => {
    const promises = tokens.map(async (token) => {
      const marketAddresses = await factory.getMarketsBySettlmentToken(
        token.address
      );
      const promise = marketAddresses.map(async (marketAddress) => {
        const market = USUMMarket__factory.connect(marketAddress, signer);
        const longFeeRates = FEE_RATES.map((rate) => bigNumberify(rate));
        const precision = bigNumberify(10).pow(10);
        const shortFeeRates = [...FEE_RATES]
          .reverse()
          .map((rate) => precision.add(rate));
        const feeRates = [...shortFeeRates, ...longFeeRates];
        const addresses = Array.from({ length: feeRates.length }).map(
          () => walletAddress
        );
        const baseFeeRates = [
          ...[...FEE_RATES].reverse().map((rate) => rate * -1),
          ...FEE_RATES,
        ];

        const balances = await market.balanceOfBatch(addresses, feeRates);
        const slotsPromise = balances.map(async (balance, balanceIndex) => {
          const totalLiquidity = await market.getSlotMarginTotal(
            baseFeeRates[balanceIndex]
          );
          const unusedLiquidity = await market.getSlotMarginUnused(
            baseFeeRates[balanceIndex]
          );
          return {
            feeRate: baseFeeRates[balanceIndex],
            balance,
            totalLiquidity,
            unusedLiquidity,
          } satisfies LPTokenSlot;
        });
        const slotsResponse = await Promise.allSettled(slotsPromise);
        const slots = slotsResponse
          .filter(
            (result): result is PromiseFulfilledResult<LPTokenSlot> =>
              result.status === "fulfilled"
          )
          .map(({ value }) => value);

        return {
          tokenAddress: token.address,
          marketAddress,
          slots,
        } as const;
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

export default useLpToken;
