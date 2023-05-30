import { useUsumBalances } from "~/hooks/useBalances";
import useConnectOnce from "~/hooks/useConnectOnce";
import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { usePosition } from "~/hooks/usePosition";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useTradeInput } from "~/hooks/useTradeInput";
import { TradePanel } from "~/stories/template/TradePanel";

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
    onLeverageChange: onShortLeverageChange,
    onTakeProfitChange: onShortTakeProfitChange,
    onStopLossChange: onShortStopLossChange,
    onOpenPosition: onOpenShortPosition,
  } = useTradeInput();
  const [balances] = useUsumBalances();
  const [token] = useSelectedToken();
  const [
    _,
    [
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    ],
  ] = useSelectedLiquidityPool();
  const [positions] = usePosition();

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
