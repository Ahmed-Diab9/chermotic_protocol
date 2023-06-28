import { useEffect } from 'react';
import useConnectOnce from '~/hooks/useConnectOnce';
import { useLiquiditiyPool } from '~/hooks/useLiquidityPool';
import { usePosition } from '~/hooks/usePosition';
import { useTradeInput } from '~/hooks/useTradeInput';
import { useAppSelector } from '~/store';
import { TradePanel } from '~/stories/template/TradePanel';
import { useUsumAccount } from '../../../hooks/useUsumAccount';

const TradePanelDemo = () => {
  useConnectOnce();
  const {
    state: longInput,
    onChange: onLongChange,
    onMethodToggle: onLongMethodToggle,
    onLeverageChange: onLongLeverageChange,
    onTakeProfitChange: onLongTakeProfitChange,
    onStopLossChange: onLongStopLossChange,
    onOpenPosition: onOpenLongPosition,
  } = useTradeInput();
  const {
    state: shortInput,
    onChange: onShortChange,
    onMethodToggle: onShortMethodToggle,
    onDirectionToggle: onShortDirectionToggle,
    onLeverageChange: onShortLeverageChange,
    onTakeProfitChange: onShortTakeProfitChange,
    onStopLossChange: onShortStopLossChange,
    onOpenPosition: onOpenShortPosition,
  } = useTradeInput();
  // const { usumBalances } = useUsumBalances();
  const { balances } = useUsumAccount();
  const token = useAppSelector((state) => state.token.selectedToken);
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquiditiyPool();
  const { positions } = usePosition();

  useEffect(() => {
    if (shortInput.direction !== 'short') {
      onShortDirectionToggle();
    }
  }, [shortInput.direction, onShortDirectionToggle]);

  return (
    <TradePanel
      longInput={longInput}
      onLongChange={onLongChange}
      onLongMethodToggle={onLongMethodToggle}
      onLongLeverageChange={onLongLeverageChange}
      onLongTakeProfitChange={onLongTakeProfitChange}
      onLongStopLossChange={onLongStopLossChange}
      shortInput={shortInput}
      onShortChange={onShortChange}
      onShortMethodToggle={onShortMethodToggle}
      onShortLeverageChange={onShortLeverageChange}
      onShortTakeProfitChange={onShortTakeProfitChange}
      onShortStopLossChange={onShortStopLossChange}
      balances={balances}
      token={token}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
      onOpenLongPosition={onOpenLongPosition}
      onOpenShortPosition={onOpenShortPosition}
    />
  );
};

export default TradePanelDemo;
