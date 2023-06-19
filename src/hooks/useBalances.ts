import { useMemo } from "react";
import { useAccount, useSigner } from "wagmi";
import { BigNumber } from "ethers";
import useSWR from "swr";

import { IERC20__factory } from "@chromatic-protocol/sdk";

import { isValid } from "~/utils/valid";
import { errorLog, infoLog } from "~/utils/log";

import { useUsumAccount } from "~/hooks/useUsumAccount";
import {
  useSelectedToken,
  useSettlementToken,
} from "~/hooks/useSettlementToken";
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
  const [tokens] = useSettlementToken();

  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();

  const fetchKey =
    isValid(signer) && isValid(tokens) && isValid(walletAddress)
      ? ([signer, tokens, walletAddress] as const)
      : undefined;

  const {
    data: accountBalance,
    error,
    mutate,
  } = useSWR(fetchKey, async ([signer, tokens, address]) => {
    const promise = tokens.map(async (token) => {
      const contract = IERC20__factory.connect(token.address, signer);
      const balance = await contract.balanceOf(address);
      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    return filterResponse(response);
  });

  if (error) {
    errorLog(error);
  }

  return [accountBalance, mutate] as const;
};

export const useUsumBalances = () => {
  const [tokens] = useSettlementToken();
  const { account } = useUsumAccount();

  const fetchKey = useMemo(
    () =>
      isValid(tokens) && isValid(account)
        ? ([tokens, account] as const)
        : undefined,
    [tokens, account]
  );
  const {
    data: usumBalances,
    error,
    mutate: fetchUsumBalances,
  } = useSWR(fetchKey, async ([tokens, account]) => {
    const promise = tokens.map(async (token) => {
      const balance = await account.balance(token.address);
      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    return filterResponse(response);
  });

  if (error) {
    errorLog(error);
  }

  return { usumBalances, fetchUsumBalances };
};

export const useUsumMargins = () => {
  const { usumBalances } = useUsumBalances();
  const { positions = [] } = usePosition();
  const [token] = useSelectedToken();

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
