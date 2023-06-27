import { useSigner } from "wagmi";
import { useChromaticClient } from "./useChromaticClient";


import { useMemo } from "react";

export const useRouter = () => {
  const { data: signer } = useSigner();
  const { client } = useChromaticClient();
  const router = useMemo(() => {
    if (client) return client?.router().routerContract;
  }, [client, signer]);

  return [router, undefined] as const;
};
