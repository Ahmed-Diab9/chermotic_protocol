import { useMemo } from "react";
import { useAccount, useSigner } from "wagmi";
import { BigNumber } from "ethers";
import useSWR from "swr";

import { IERC20__factory } from "@quarkonix/usum";

import { isValid } from "~/utils/valid";
import { errorLog } from "~/utils/log";

import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useSettlementToken } from "~/hooks/useSettlementToken";

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
  const [account] = useUsumAccount();

  const fetchKey = useMemo(
    () =>
      isValid(tokens) && isValid(account)
        ? ([tokens, account] as const)
        : undefined,
    [tokens, account]
  );
  const {
    data: accountBalance,
    error,
    mutate,
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

  return [accountBalance, mutate] as const;
};
