import useSWR from "swr";
import { useSigner } from "wagmi";
import { useChromaticClient } from "./useChromaticClient";

import { ChromaticRouter__factory } from "@chromatic-protocol/sdk/contracts";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";
import { useMemo, useEffect } from "react";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useRouter = () => {
  const { data: signer } = useSigner();
  const {client} = useChromaticClient()
  const router = useMemo(() => {
    console.log('useRouter client', client)
    console.log('useRouter', client?.router().routerContract)
    return client?.router().routerContract
  }, [signer])

  return [router, undefined] as const;
};
