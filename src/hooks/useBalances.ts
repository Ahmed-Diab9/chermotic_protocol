import { useMemo } from "react";
import { useAccount, useSigner } from "wagmi";
import { BigNumber } from "ethers";
import useSWR from "swr";
import { useAppSelector } from "../store";
import { IERC20__factory } from "@chromatic-protocol/sdk/contracts";
import { isValid } from "~/utils/valid";
import { errorLog, infoLog } from "~/utils/log";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useSettlementToken } from "~/hooks/useSettlementToken";
import { usePosition } from "./usePosition";
import { bigNumberify } from "~/utils/number";

function filterResponse(
  response: PromiseSettledResult<readonly [string, BigNumber]>[]
) {
  return response
    .filter((result): result is PromiseFulfilledResult<[string, BigNumber]> => {
      return result.status === "fulfilled";
    })
    .reduce((acc, { value }) => {
      const [token, balance] = value;
      acc[token] = balance;
      return acc;
    }, {} as Record<string, BigNumber>);
}

export const useWalletBalances = () => {
  const { tokens = [] } = useSettlementToken();

  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();

  const {
    data: walletBalances,
    error,
    mutate: fetchWalletBalances,
  } = useSWR(
    isValid(walletAddress) ? ["WALLET_BALANCES", walletAddress] : undefined,
    async ([_, address]) => {
      if (!isValid(signer)) {
        return;
      }
    const promise = tokens.map(async (token) => {
      const contract = IERC20__factory.connect(token.address, signer);
      const balance = await contract.balanceOf(address);
      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    const result = filterResponse(response);
    console.log("useBalance", result);
    return result;
    }
  );

  if (error) {
    errorLog(error);
  }

  return { walletBalances, fetchWalletBalances } as const;
};

export const useUsumBalances = () => {
  const { tokens = [] } = useSettlementToken();
  const { account } = useUsumAccount();
  const {
    data: usumBalances,
    error,
    mutate: fetchUsumBalances,
  } = useSWR(
    isValid(account) ? ["USUM_BALANCES", account.address] : undefined,
    async ([_, address]) => {
      if (!isValid(account)) {
        return;
      }
    const promise = tokens.map(async (token) => {
      const balance = await account.balance(token.address);
      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    return filterResponse(response);
    }
  );

  if (error) {
    errorLog(error);
  }

  return { usumBalances, fetchUsumBalances };
};

export const useUsumMargins = () => {
  const { usumBalances } = useUsumBalances();
  const { positions = [] } = usePosition();
  const token = useAppSelector((state) => state.market.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (!isValid(usumBalances) || !isValid(token)) {
      return [bigNumberify(0), bigNumberify(0)];
    }
    const balance = usumBalances[token.name];
    const [totalCollateral, totalCollateralAdded] = positions.reduce(
      (record, position) => {
        const added = position.addProfitAndLoss(18);
        return [record[0].add(position.collateral), record[1].add(added)];
      },
      [bigNumberify(0), bigNumberify(0)]
    );
    return [balance.add(totalCollateral), balance.add(totalCollateralAdded)];
  }, [usumBalances, token, positions]);

  const totalMargin = useMemo(() => {
    if (isValid(usumBalances) && isValid(token)) {
      return usumBalances[token.name];
    }
    return bigNumberify(0);
  }, [usumBalances, token]);

  return {
    totalBalance,
    totalAsset,
    totalMargin,
  };
};
