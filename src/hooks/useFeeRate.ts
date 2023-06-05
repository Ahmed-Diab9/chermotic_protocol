import { useMemo } from "react";
import useSWR from "swr";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useMarketFactory } from "~/hooks/useMarketFactory";
import { isValid } from "~/utils/valid";
import { errorLog } from "~/utils/log";

export const useFeeRate = () => {
  const [marketFactory] = useMarketFactory();
  const [selectedToken] = useSelectedToken();
  const fetchKey = useMemo(() => {
    if (isValid(marketFactory) && isValid(selectedToken)) {
      return [marketFactory, selectedToken] as const;
    }
  }, [marketFactory, selectedToken]);

  const { data: feeRate, error } = useSWR(
    fetchKey,
    ([factory, token]) => {
      // @TODO
      // 연이율(Interest Rate)에 적용시켜야 할 소수점(Decimals) 값이 필요합니다.
      return factory.currentInterestRate(token.address);
    },
    {
      revalidateOnFocus: false,
    }
  );

  if (error) {
    errorLog(error);
  }

  return feeRate;
};
