import { ChartTooltip } from '~/stories/atom/ChartTooltip';

import { withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

interface SelectedTooltipProps {
  id?: string;
  data?: number;
}

export const SelectedTooltip = ({ id = '', data }: SelectedTooltipProps) => {
  if (!data) return null;

  function toString(num?: number) {
    return isValid(num) ? withComma(num) : '-';
  }

  return (
    <ChartTooltip
      anchor={`#${id} .react_range__bar_stack.selected`}
      render={() => {
        return (
          <div>
            <p className="font-semibold text-black1">Maker Margin: {toString(data)}</p>
          </div>
        );
      }}
    />
  );
};
