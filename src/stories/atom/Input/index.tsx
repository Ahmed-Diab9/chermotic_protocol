import './style.css';

import { Avatar } from '../Avatar';
import { isValid } from '~/utils/valid';
import { withComma } from '~/utils/number';
import { ChangeEvent, FocusEventHandler } from 'react';

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
  onBlur?: FocusEventHandler<HTMLInputElement>;
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
    onBlur,
  } = props;

  function handleAutoCorrect(newValue?: string | number) {
    if (!isValid(newValue)) {
      return;
    } else if (isValid(min) && +newValue < min) {
      onChange!(min.toString());
    } else if (newValue === '') {
      onChange!('');
    } else if (isValid(max) && +newValue > max) {
      onChange!(max.toString());
    } else {
      onChange!(newValue.toString());
    }
  }

  function trimLeadingZero(str: string) {
    return str.replace(/^0+(?!\.|$)/, '');
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const newValue = trimLeadingZero(event.target.value);
    if (isValid(onChange)) {
      if (autoCorrect) handleAutoCorrect(newValue);
      else onChange(newValue);
    }
  }

  return (
    <div className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className}`}>
      {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}
      <input
        type="string"
        className={`text-${align}`}
        value={type === 'number' ? withComma(value) : value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
      />
      {unit ? <span className="text-black/30">{unit}</span> : null}
    </div>
  );
};
