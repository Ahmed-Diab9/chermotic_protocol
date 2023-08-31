import { isNotNil } from 'ramda';
import { ChartTooltip } from '~/stories/atom/ChartTooltip';

import { withComma } from '~/utils/number';

interface SelectedTooltipProps {
  id?: string;
  data?: number;
}

export const SelectedTooltip = ({ id = '', data }: SelectedTooltipProps) => {
  if (!data) return null;

  function toString(num?: number) {
    return isNotNil(num) ? withComma(num) : '-';
  }

  return (
    <ChartTooltip
      anchor={`#${id} .react_range__bar_stack.selected`}
      render={() => {
        return (
          <div>
            <p className="font-semibold text-primary">Maker Margin: {toString(data)}</p>
          </div>
        );
      }}
    />
  );
};
