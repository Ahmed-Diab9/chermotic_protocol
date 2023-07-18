import './style.css';

import { ChangeEvent, useEffect, useState } from 'react';

import { Avatar } from '~/stories/atom/Avatar';

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
  onBlur?: () => unknown;
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

  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  function isOverMax(newValue?: string | number) {
    return newValue === undefined || !isValid(max) || +newValue > max;
  }

  function isUnderMin(newValue?: string | number) {
    return newValue === undefined || !isValid(min) || +newValue < min;
  }

  function trimLeadingZero(str: string) {
    return str.replace(/^0+(?!\.|$)/, '');
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const newValue = trimLeadingZero(event.target.value);

    if (!isValid(onChange)) return setTempValue(newValue);
    if (!autoCorrect) return onChange(newValue);

    if (isValid(max) && isOverMax(newValue)) {
      onChange(max!.toString());
      setTempValue(max!.toString());
    } else if (isValid(min) && isUnderMin(newValue)) {
      onChange(min!.toString());
      setTempValue(newValue);
    } else {
      onChange(newValue);
      setTempValue(newValue);
    }
  }

  function handleBlur() {
    if (autoCorrect && isValid(min) && isUnderMin(tempValue)) {
      setTempValue(value);
    }
    if (isValid(onBlur)) {
      onBlur();
    }
  }

  return (
    <div className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className}`}>
      {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}
      <input
        type="string"
        className={`text-${align}`}
        value={type === 'number' ? withComma(tempValue) : tempValue}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {unit ? <span className="text-black/30">{unit}</span> : null}
    </div>
  );
};
