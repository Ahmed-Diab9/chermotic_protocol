import { Button } from '../Button';
import MinusIcon from '~/assets/icons/MinusIcon';
import PlusIcon from '~/assets/icons/PlusIcon';

interface CounterProps {
  label?: string;
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  value?: number | string;
  symbol?: string;
  onClick?: () => unknown;
  onIncrement?: () => unknown;
  onDecrement?: () => unknown;
}

export const Counter = (props: CounterProps) => {
  const { value, symbol, onIncrement, onDecrement } = props;

  return (
    <div className="flex items-stretch justify-center w-full gap-0">
      <Button
        onClick={onDecrement}
        label="minus"
        iconOnly={<MinusIcon />}
        className="!text-primary"
      />
      <div className="flex items-center justify-center w-1/2">
        <h4 className="font-bold text-center">
          {typeof value === 'number' ? value?.toFixed(2) : value}
          {symbol}
        </h4>
      </div>
      <Button
        onClick={onIncrement}
        label="plus"
        iconOnly={<PlusIcon />}
        className="!text-primary"
      />
    </div>
  );
};
