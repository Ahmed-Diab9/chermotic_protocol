import './style.css';

import { isNil, isNotNil } from 'ramda';
import { ChangeEvent, useEffect, useState } from 'react';
import { Avatar } from '~/stories/atom/Avatar';
import { numberFormat } from '~/utils/number';

interface InputProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  assetSrc?: string;
  unit?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  css?: 'default' | 'active';
  align?: 'center' | 'left' | 'right';
  disabled?: boolean;
  error?: boolean;
  autoCorrect?: boolean;
  min?: number;
  max?: number;
  minDigits?: number;
  maxDigits?: number;
  useGrouping?: boolean;
  onChange?: (value: string) => unknown;
}

export const Input = (props: InputProps) => {
  const {
    placeholder,
    assetSrc,
    unit,
    className = '',
    size = 'base',
    css = 'default',
    align = 'right',
    value,
    min,
    max,
    disabled = false,
    error = false,
    autoCorrect = false,
    minDigits,
    maxDigits,
    useGrouping = true,
    onChange,
  } = props;
  const [displayValue, setDisplayValue] = useState(value);
  const [isInternalChange, setIsInternalChange] = useState(false);

  const setFormattedDisplayValue = (value?: number | string) => {
    if (isNil(value)) return setDisplayValue(value);
    const formatted = numberFormat(value, { minDigits, maxDigits, useGrouping });
    return setDisplayValue(formatted);
  };

  useEffect(() => {
    if (!isInternalChange) setFormattedDisplayValue(value);
    return setIsInternalChange(false);
  }, [value]);

  function isOverMax(newValue?: string | number) {
    return newValue === undefined || isNil(max) || +newValue > max;
  }

  function isUnderMin(newValue?: string | number) {
    return newValue === undefined || isNil(min) || +newValue < min;
  }

  function trimLeadingZero(str: string) {
    return str.replace(/^0+(?!\.|$)/, '');
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const newValue = trimLeadingZero(event.target.value)
      .replaceAll(',', '')
      .replace(/[^0-9.]/g, '');

    if (newValue === displayValue || isNaN(+newValue)) {
      return;
    }

    if (isNil(onChange)) {
      setDisplayValue(newValue);
      return;
    }

    setIsInternalChange(true);

    if (!autoCorrect) {
      setDisplayValue(newValue);
      onChange(newValue);
      return;
    }

    if (isNotNil(max) && isOverMax(newValue)) {
      onChange(max!.toString());
      setDisplayValue(max!.toString());
    } else if (isNotNil(min) && isUnderMin(newValue)) {
      onChange(min!.toString());
      setDisplayValue(newValue);
    } else {
      onChange(newValue);
      setDisplayValue(newValue);
    }
  }

  function handleBlur() {
    if (autoCorrect && isNotNil(min) && isUnderMin(displayValue)) {
      setFormattedDisplayValue(value);
      return;
    }
    if (isNotNil(onChange) && isNotNil(displayValue)) {
      setFormattedDisplayValue(+displayValue);
      return;
    }
  }

  return (
    <>
      <div
        className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className} ${
          error ? 'error' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}

        <input
          type="text"
          className={`text-${align}`}
          value={displayValue}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </>
  );
};
