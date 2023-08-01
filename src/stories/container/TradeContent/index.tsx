import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMarket } from '~/hooks/useMarket';
import { useOracleProperties } from '~/hooks/useOracleProperties';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTradeInput } from '~/hooks/useTradeInput';
import { TradeContent as TradeContentPresenter } from '~/stories/molecule/TradeContent';
import { Liquidity } from '~/typings/chart';

interface Props {
  direction?: 'long' | 'short';
  liquidityData?: Liquidity[];
  totalMaxLiquidity?: bigint;
  totalUnusedLiquidity?: bigint;
}

export const TradeContent = (props: Props) => {
  const { direction = 'long', liquidityData, totalMaxLiquidity, totalUnusedLiquidity } = props;
  const {
    state: input,
    tradeFee,
    feePercent,
    disabled,
    onAmountChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
    onFeeAllowanceValidate,
  } = useTradeInput({ direction });
  const { oracleProperties } = useOracleProperties();
  const { balances, isAccountAddressLoading, isChromaticBalanceLoading } = useChromaticAccount();
  const { priceFeed } = usePriceFeed();
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();

  return (
    <TradeContentPresenter
      direction={direction}
      isLoading={isAccountAddressLoading || isChromaticBalanceLoading}
      balances={balances}
      priceFeed={priceFeed}
      token={currentToken}
      market={currentMarket}
      totalMaxLiquidity={totalMaxLiquidity}
      totalUnusedLiquidity={totalUnusedLiquidity}
      liquidityData={liquidityData}
      input={input}
      tradeFee={tradeFee}
      tradeFeePercent={feePercent}
      disabled={disabled.status}
      maxTakeProfit={oracleProperties?.maxTakeProfit}
      minTakeProfit={oracleProperties?.minTakeProfit}
      maxLeverage={oracleProperties?.maxLeverage}
      minStopLoss={oracleProperties?.minStopLoss}
      onAmountChange={onAmountChange}
      onMethodToggle={onMethodToggle}
      onLeverageChange={onLeverageChange}
      onTakeProfitChange={onTakeProfitChange}
      onStopLossChange={onStopLossChange}
      onFeeAllowanceChange={onFeeAllowanceChange}
      onFeeValidate={onFeeAllowanceValidate}
    />
  );
};
