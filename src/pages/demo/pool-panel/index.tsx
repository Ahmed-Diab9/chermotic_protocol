import { PoolPanel } from "~/stories/template/PoolPanel";

import useConnectOnce from "~/hooks/useConnectOnce";
import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { useSelectedMarket } from "~/hooks/useMarket";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useWalletBalances } from "~/hooks/useBalances";
import usePoolInput from "~/hooks/usePoolInput";

const PoolPanelDemo = () => {
  useConnectOnce();
  const {
    pool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useSelectedLiquidityPool();
  const [token] = useSelectedToken();
  const [walletBalances] = useWalletBalances();
  const {
    amount,
    rates,
    binCount,
    binAverage,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
    move,
    rangeChartRef,
  } = usePoolInput();

  return (
    <PoolPanel
      token={token}
      balances={walletBalances}
      pool={pool}
      amount={amount}
      rates={rates}
      binCount={binCount}
      binAverage={binAverage}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
      onAmountChange={onAmountChange}
      onRangeChange={onRangeChange}
      onFullRangeSelect={onFullRangeSelect}
      onAddLiquidity={onAddLiquidity}
      rangeChartRef={rangeChartRef}
      onMinIncrease={move().left.next}
      onMinDecrease={move().left.prev}
      onMaxIncrease={move().right.next}
      onMaxDecrease={move().right.prev}
    />
  );
};

export default PoolPanelDemo;
