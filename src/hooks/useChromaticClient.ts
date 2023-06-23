import { Client } from "@chromatic-protocol/sdk";
import { useEffect, useRef } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";

let client: Client | undefined;
export function useChromaticClient() {
  const { isConnected } = useAccount();

  const provider = useProvider();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (!client) {
      // console.log("new client");
      client = new Client("anvil", signer || provider);
    }
  }, []);

  useEffect(() => {
    // console.log('client useEffect', provider, signer, isConnected)
    if (client) {
      if (isConnected && signer) client.signer = signer;
      if (provider) client.provider = provider;
    }
  }, [provider]);

  return {
    client,
  };
}
