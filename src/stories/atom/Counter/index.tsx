import { Button } from '../Button';
import { PlusIcon, MinusIcon } from '~/assets/icons/Icon';

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
        css="light"
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
        css="light"
        iconOnly={<PlusIcon />}
        className="!text-primary"
      />
    </div>
  );
};
