import useConnectOnce from "../../../hooks/useConnectOnce";
import { useSelectedLiquidityPool } from "../../../hooks/useLiquidityPool";
import { PoolPanel } from "../../../stories/template/PoolPanel";
import { useSelectedToken } from "../../../hooks/useSettlementToken";
import { useSelectedMarket } from "../../../hooks/useMarket";
import { useWalletBalances } from "../../../hooks/useBalances";
import usePoolInput from "../../../hooks/usePoolInput";

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
  const [market] = useSelectedMarket();
  const [walletBalances] = useWalletBalances();
  const {
    amount,
    indexes,
    rates,
    bins,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
  } = usePoolInput();

  return (
    <PoolPanel
      token={token}
      balances={walletBalances}
      pool={pool}
      amount={amount}
      indexes={indexes}
      rates={rates}
      bins={bins}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
      onAmountChange={onAmountChange}
      onRangeChange={onRangeChange}
      onFullRangeSelect={onFullRangeSelect}
      onAddLiquidity={onAddLiquidity}
    />
  );
};

export default PoolPanelDemo;
