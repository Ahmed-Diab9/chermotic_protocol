import useConnectOnce from "../../../hooks/useConnectOnce";
import { useSelectedLiquidityPool } from "../../../hooks/useLiquidityPool";
import { PoolPanel } from "../../../stories/template/PoolPanel";
import { useSelectedToken } from "../../../hooks/useSettlementToken";
import { useSelectedMarket } from "../../../hooks/useMarket";
import { useWalletBalances } from "../../../hooks/useBalances";
import usePoolInput from "../../../hooks/usePoolInput";
import { useMemo } from "react";
import { bigNumberify } from "../../../utils/number";

const PoolPanelDemo = () => {
  useConnectOnce();
  const [pool] = useSelectedLiquidityPool();
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

  const slots = pool?.tokens.filter((lpToken) => lpToken.balance.gt(0));
  const [longTotalMaxLiquidity, longTotalUnusedLiquidity] = useMemo(() => {
    const longLpTokens = (pool?.tokens ?? []).filter(
      (lpToken) => lpToken.feeRate > 0
    );
    return longLpTokens?.reduce(
      (acc, currentToken) => {
        const max = acc[0].add(currentToken.maxLiquidity);
        const unused = acc[1].add(currentToken.unusedLiquidity);
        return [max, unused];
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);
  const [shortTotalMaxLiquidity, shortTotalUnusedLiquidity] = useMemo(() => {
    const shortLpTokens = (pool?.tokens ?? []).filter(
      (lpToken) => lpToken.feeRate < 0
    );
    return shortLpTokens?.reduce(
      (acc, currentToken) => {
        acc[0].add(currentToken.maxLiquidity);
        acc[1].add(currentToken.unusedLiquidity);
        return acc;
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [pool]);

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
