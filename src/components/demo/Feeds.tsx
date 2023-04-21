import { BigNumber } from "ethers";
import { useContract, useNetwork, useSigner } from "wagmi";
import App from "../../abis/demo/App.json";
import { useCallback, useEffect, useReducer, useState } from "react";
import type { FormEvent } from "react";

/**
 * FIXME: need `.env.local`
 */
const contractAddress = import.meta.env.VITE_DEMO_CONTRACT;

type Feed = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: number;
};
type FeedResponse = [BigNumber, string, string, string, BigNumber];

type FormState = {
  title: string;
  content: string;
};
type FormAction<T = "title" | "content"> = T extends "title"
  ? {
      type: T;
      payload: Pick<FormState, T>;
    }
  : T extends "content"
  ? { type: T; payload: Pick<FormState, T> }
  : never;

const Feeds = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner({
    chainId: chain?.id,
    suspense: false,
  });
  const contract = useContract({
    address: contractAddress,
    abi: App.abi,
    signerOrProvider: signer,
  });
};

export default Feeds;
