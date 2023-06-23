import useConnectOnce from "../../../hooks/useConnectOnce";
import { useBinsBySelectedMarket } from "../../../hooks/useLiquidityPool";
import { PoolPanel } from "../../../stories/template/PoolPanel";
import { useWalletBalances } from "../../../hooks/useBalances";
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
  } = useBinsBySelectedMarket();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { walletBalances } = useWalletBalances();
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
