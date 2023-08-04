import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useAppSelector } from '~/store';
import { RemoveLiquidityModal as RemoveLiquidityModalPresenter } from '~/stories/template/RemoveLiquidityModal';

export const RemoveLiquidityModal = () => {
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const { amount, maxAmount, onAmountChange } = usePoolRemoveInput();
  const { currentToken } = useSettlementToken();

  return (
    <RemoveLiquidityModalPresenter
      selectedBin={selectedBins[0]}
      token={currentToken}
      amount={amount}
      maxAmount={maxAmount}
      onAmountChange={onAmountChange}
    />
  );
};
