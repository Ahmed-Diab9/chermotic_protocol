import useChartData from '~/hooks/useChartData';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { TradePanel as TradePanelPresenter } from '~/stories/template/TradePanel';

export const TradePanel = () => {
  const { liquidity, positive, negative, clbTokenValues } = useChartData();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();

  return (
    <TradePanelPresenter
      liquidityData={liquidity}
      clbTokenValues={clbTokenValues}
      longLiquidityData={positive}
      shortLiquidityData={negative}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
    />
  );
};
