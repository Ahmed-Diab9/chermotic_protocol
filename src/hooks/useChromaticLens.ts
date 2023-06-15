import { ChromaticLens, getDeployedContract } from "@chromatic-protocol/sdk";
import { useMemo } from "react";
import { useProvider } from "wagmi";

export const useChromaticLens = () => {
  const provider = useProvider();

  return useMemo(() => {
    return getDeployedContract(
      "ChromaticLens",
      "anvil",
      provider
    ) as ChromaticLens;
  }, [provider]);
};
