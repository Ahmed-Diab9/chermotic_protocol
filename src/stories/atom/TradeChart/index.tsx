import { FillUpChart } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { SelectedTooltip } from '~/stories/molecule/SelectedTooltip';

import LOADING from '~/assets/images/loading.png';
import { useTradeChart } from './hooks';

export interface TradeChartProps {
  id: string;
  negative?: boolean;
  positive?: boolean;
  selectedAmount?: number;
  height: number;
  width?: number;
  selectableLabel?: string;
}

export default function TradeChart(props: TradeChartProps) {
  const { id } = props;

  const { tokenName, liquidityTooltipProps, selectedTooltipProps, fillupChartProps, isLoading } =
    useTradeChart(props);

  return (
    <>
      <SelectedTooltip id={id} {...selectedTooltipProps} />
      <LiquidityTooltip id={id} {...liquidityTooltipProps} tokenName={tokenName} />
      <div id={id} className="flex items-center justify-center h-[100px]">
        {isLoading ? (
          <img src={LOADING} className="w-10 animate-spin" alt="loading..." />
        ) : (
          <FillUpChart {...fillupChartProps} />
        )}
      </div>
    </>
  );
}
