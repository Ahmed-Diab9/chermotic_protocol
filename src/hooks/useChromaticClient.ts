import { Client } from "@chromatic-protocol/sdk";
import { useEffect } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";

let client: Client | undefined;
export function useChromaticClient() {
  const { isConnected } = useAccount();

  const provider = useProvider();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (!client) {
      client = new Client("anvil", signer || provider);
    }
  }, []);

  useEffect(() => {
    if (client) {
      if (isConnected && signer) client.signer = signer;
      if (provider) client.provider = provider;
    }
  }, [signer, provider]);

  return {
    client,
  };
}
