import { useChromaticClient } from "./useChromaticClient";

export const useMarketFactory = (_interval?: number) => {
  const {client} = useChromaticClient()

  const marketFactory = client?.marketFactory()
  return [marketFactory, undefined] as const;
};
