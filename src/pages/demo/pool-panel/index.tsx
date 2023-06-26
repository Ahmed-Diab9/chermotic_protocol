import { PoolPanel } from "~/stories/template/PoolPanel";

import usePoolInput from "~/hooks/usePoolInput";
import useConnectOnce from "~/hooks/useConnectOnce";
import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useWalletBalances } from "~/hooks/useBalances";

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
      binCount={binCount}
      binAverage={binAverage}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
      rates={rates}
      onAmountChange={onAmountChange}
      onRangeChange={onRangeChange}
      onAddLiquidity={onAddLiquidity}
      rangeChartRef={rangeChartRef}
      onMinIncrease={move.left.next}
      onMinDecrease={move.left.prev}
      onMaxIncrease={move.right.next}
      onMaxDecrease={move.right.prev}
      onFullRange={move.full}
    />
  );
};

export default PoolPanelDemo;
