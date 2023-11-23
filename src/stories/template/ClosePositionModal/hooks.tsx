import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useSettlementToken } from '~/hooks/useSettlementToken';

export function useClosePositonModal() {
  const { onAmountChange } = usePoolRemoveInput();
  const { currentToken } = useSettlementToken();

  const onClose = () => {
    onAmountChange();
  };

  return {
    onClose,
  };
}
