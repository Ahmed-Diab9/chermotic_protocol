import useConnectOnce from "../../../hooks/useConnectOnce";
import useConsole from "../../../hooks/useConsole";
import { useSelectedLpTokens } from "../../../hooks/useLpToken";
import { PoolPanel } from "../../../stories/template/PoolPanel";
import useOracleVersion from "../../../hooks/useOracleVersion";
import { useSelectedToken } from "../../../hooks/useSettlementToken";
import { useSelectedMarket } from "../../../hooks/useMarket";
import useBalances from "../../../hooks/useBalances";
import usePoolInput from "../../../hooks/usePoolInput";
import { useMemo } from "react";
import { bigNumberify } from "../../../utils/number";

const PoolPanelDemo = () => {
  useConnectOnce();
  const [lpToken] = useSelectedLpTokens();
  const [token] = useSelectedToken();
  const [market] = useSelectedMarket();
  const { walletBalances } = useBalances();
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
  useOracleVersion();

  const slots = lpToken?.slots.filter((slot) => slot.balance.gt(0));
  const [longTotalMaxLiquidity, longTotalUnusedLiquidity] = useMemo(() => {
    const longSlots = (lpToken?.slots ?? []).filter((slot) => slot.feeRate > 0);
    return longSlots?.reduce(
      (acc, currentValue) => {
        acc[0].add(currentValue.maxLiquidity);
        acc[1].add(currentValue.unusedLiquidity);
        return acc;
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [lpToken]);
  const [shortTotalMaxLiquidity, shortTotalUnusedLiquidity] = useMemo(() => {
    const longSlots = (lpToken?.slots ?? []).filter((slot) => slot.feeRate < 0);
    return longSlots?.reduce(
      (acc, currentValue) => {
        acc[0].add(currentValue.maxLiquidity);
        acc[1].add(currentValue.unusedLiquidity);
        return acc;
      },
      [bigNumberify(0), bigNumberify(0)] as const
    );
  }, [lpToken]);

  return (
    <PoolPanel
      token={token}
      market={market}
      balances={walletBalances}
      lpToken={lpToken}
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
