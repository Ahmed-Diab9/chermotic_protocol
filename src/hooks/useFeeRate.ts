import { useMemo } from "react";

import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useMarketFactory } from "~/hooks/useMarketFactory";

import { isValid } from "~/utils/valid";

export const useFeeRate = () => {
  const [marketFactory] = useMarketFactory();
  const [selectedToken] = useSelectedToken();

  const feeRate = useMemo(() => {
    if (!isValid(marketFactory) || !isValid(selectedToken)) return undefined;
    return marketFactory.currentInterestRate(selectedToken.address);
  }, [selectedToken]);

  return feeRate;
};
