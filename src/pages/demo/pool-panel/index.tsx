import useConnectOnce from "../../../hooks/useConnectOnce";
import { useLiquiditiyPool } from "../../../hooks/useLiquidityPool";
import { PoolPanel } from "../../../stories/template/PoolPanel";
import { useTokenBalances } from "../../../hooks/useBalances";
import usePoolInput from "../../../hooks/usePoolInput";
import { useAppSelector } from "~/store";

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
  } = useLiquiditiyPool();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { useTokenBalances: walletBalances } = useTokenBalances();
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
      // ownedPool={pool}
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
