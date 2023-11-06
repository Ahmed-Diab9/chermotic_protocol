import { useSettlementToken } from '~/hooks/useSettlementToken';

export const usePoolPerformance = () => {
  const { currentToken } = useSettlementToken();

  return { tokenName: currentToken?.name };
};
