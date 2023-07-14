import './style.css';

import { Avatar } from '../Avatar';
import { isValid } from '~/utils/valid';
import { withComma } from '~/utils/number';

interface InputProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  assetSrc?: string;
  unit?: string;
  type?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  css?: 'default' | 'active';
  align?: 'center' | 'left' | 'right';
  disabled?: boolean;
  autoCorrect?: boolean;
  min?: number;
  max?: number;
  onChange?: (value: string) => unknown;
  onClickAway?: () => unknown;
}

export const Input = (props: InputProps) => {
  const {
    placeholder,
    assetSrc,
    unit,
    type = 'number',
    className,
    size = 'base',
    css = 'default',
    align = 'right',
    value,
    min,
    max,
    autoCorrect = false,
    onChange,
    onClickAway,
  } = props;

  function handleAutoCorrect() {
    if (!isValid(value)) return;
    else if (isValid(max) && +value > max) onChange?.(withComma(max) ?? '0');
    else if (isValid(min) && +value < min) onChange?.(withComma(min) ?? '0');
  }

  function handleBlur() {
    if (onClickAway) onClickAway();
    if (autoCorrect) handleAutoCorrect();
  }

  return (
    <div className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className}`}>
      {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}
      <input
        type="string"
        className={`text-${align}`}
        value={type === 'number' ? withComma(value) : value}
        placeholder={placeholder}
        onChange={(event) => {
          event.preventDefault();
          onChange && onChange(event.target.value);
        }}
        onBlur={handleBlur}
      />
      {unit ? <span className="text-black/30">{unit}</span> : null}
    </div>
  );
};
