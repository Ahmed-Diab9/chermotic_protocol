import { ethers } from "ethers";
import { isValid } from "./valid";
import { errorLog } from "./log";

/**
 * Use when signer is needed in `useSWR`, which should cache response data.
 * @param walletAddress
 * @returns Signer
 */
export const createSignerManual = (walletAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  if (!isValid(provider)) {
    errorLog("can not create web3 provider");
    return;
  }
  const signer = provider.getSigner(walletAddress);
  return signer;
};
