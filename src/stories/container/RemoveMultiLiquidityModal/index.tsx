import { useMultiPoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useAppSelector } from '~/store';
import { RemoveMultiLiquidityModal as RemoveMultiLiquidityModalPresenter } from '~/stories/template/RemoveMultiLiquidityModal';

export const RemoveMultiLiquidityModal = () => {
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const { currentToken } = useSettlementToken();
  const { type, amount, clbTokenBalance, onAmountChange } = useMultiPoolRemoveInput();

  return (
    <RemoveMultiLiquidityModalPresenter
      selectedBins={selectedBins}
      token={currentToken}
      type={type}
      amount={amount}
      balance={clbTokenBalance}
      onAmountChange={onAmountChange}
    />
  );
};
