import { Client } from "@chromatic-protocol/sdk";
import { useEffect, useRef } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";

export function useChromaticClient() {
  const { isConnected } = useAccount();
  const client = useRef<Client>();
  const provider = useProvider();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (!client.current) {
      console.log("new client");
      client.current = new Client("anvil", signer || provider);
    }
  }, []);

  useEffect(() => {
    console.log('client useEffect', provider, signer, isConnected)
    if (client.current) {
      if (isConnected && signer) client.current.signer = signer;
      if (provider) client.current.provider = provider;
    }
  }, [provider, signer, isConnected]);

  return {
    client: client.current,
  };
}
