import useChartData from '~/hooks/useChartData';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useMarket } from '~/hooks/useMarket';
import { useOwnedLiquidityPools } from '~/hooks/useOwnedLiquidityPools';
import usePoolInput from '~/hooks/usePoolInput';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useAppSelector } from '~/store';
import { PoolPanel as PoolPanelPresenter } from '~/stories/template/PoolPanel';

export const PoolPanel = () => {
  const { currentToken } = useSettlementToken();
  const { currentMarket, clbTokenAddress } = useMarket();
  const { tokenBalances } = useTokenBalances();
  const { currentOwnedPool } = useOwnedLiquidityPools();
  const {
    amount,
    rates,
    binCount,
    binAverage,
    binFeeRates,
    move,
    rangeChartRef,
    onAmountChange,
    onRangeChange,
  } = usePoolInput();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const isRemoveModalOpen = useAppSelector((state) => state.pools.isModalOpen);
  const { liquidity, clbTokenValue } = useChartData();

  return (
    <PoolPanelPresenter
      token={currentToken}
      market={currentMarket}
      balances={tokenBalances}
      ownedPool={currentOwnedPool}
      amount={amount}
      rates={rates}
      clbTokenAddress={clbTokenAddress}
      binCount={binCount}
      binAverage={binAverage}
      clbTokenValue={clbTokenValue}
      liquidity={liquidity}
      longTotalMaxLiquidity={longTotalMaxLiquidity}
      longTotalUnusedLiquidity={longTotalUnusedLiquidity}
      shortTotalMaxLiquidity={shortTotalMaxLiquidity}
      shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
      selectedBins={selectedBins}
      isModalOpen={isRemoveModalOpen}
      binFeeRates={binFeeRates}
      rangeChartRef={rangeChartRef}
      onAmountChange={onAmountChange}
      onRangeChange={onRangeChange}
      onMinIncrease={move.left.next}
      onMinDecrease={move.left.prev}
      onMaxIncrease={move.right.next}
      onMaxDecrease={move.right.prev}
      onFullRange={move.full}
    />
  );
};
