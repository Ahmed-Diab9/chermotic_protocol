import { useAccount, useSigner } from "wagmi";
import useSWR from "swr";
import { useSettlementToken } from "./useSettlementToken";
import { Account__factory, IERC20__factory } from "@quarkonix/usum";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { BigNumber } from "ethers";
import { useUsumAccount } from "./useUsumAccount";

const useBalances = () => {
  const [tokens] = useSettlementToken();
  const { address: walletAddress } = useAccount();
  const [usumAddress] = useUsumAccount();
  const { data: signer } = useSigner();
  const fetchWalletKey =
    isValid(signer) && isValid(tokens) && isValid(walletAddress)
      ? ([signer, tokens, walletAddress] as const)
      : undefined;
  const fetchUsumKey =
    isValid(signer) && isValid(tokens) && isValid(usumAddress)
      ? ([signer, tokens, usumAddress] as const)
      : undefined;

  const {
    data: walletBalances,
    error: walletError,
    mutate: fetchWalletBalances,
  } = useSWR(fetchWalletKey, async ([signer, tokens, address]) => {
    const promise = tokens.map(async (token) => {
      const contract = IERC20__factory.connect(token.address, signer);
      const balance = await contract.balanceOf(address);
      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    const balances = response
      .filter(
        (result): result is PromiseFulfilledResult<[string, BigNumber]> => {
          return result.status === "fulfilled";
        }
      )
      .reduce((acc, { value }) => {
        const [token, balance] = value;
        acc[token] = balance;
        return acc;
      }, {} as Record<string, BigNumber>);
    return balances;
  });

  const {
    data: usumBalances,
    error: usumError,
    mutate: fetchUsumBalances,
  } = useSWR(fetchUsumKey, async ([signer, tokens, address]) => {
    const account = Account__factory.connect(address, signer);
    const promise = tokens.map(async (token) => {
      const balance = await account.balance(token.address);

      return [token.name, balance] as const;
    });
    const response = await Promise.allSettled(promise);
    const balances = response
      .filter(
        (result): result is PromiseFulfilledResult<[string, BigNumber]> => {
          return result.status === "fulfilled";
        }
      )
      .reduce((acc, { value }) => {
        const [token, balance] = value;
        acc[token] = balance;

        return acc;
      }, {} as Record<string, BigNumber>);
    return balances;
  });

  if (walletError || usumError) {
    errorLog(walletError, usumError);
  }

  return {
    walletBalances,
    usumBalances,
    fetchWalletBalances,
    fetchUsumBalances,
  } as const;
};

export default useBalances;
