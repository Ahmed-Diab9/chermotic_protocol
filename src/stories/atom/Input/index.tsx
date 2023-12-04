import './style.css';

import { isNil, isNotNil } from 'ramda';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Avatar } from '~/stories/atom/Avatar';
import { numberFormat, withComma } from '~/utils/number';

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
  onClick?: () => unknown;
  onChange?: (value: string) => unknown;
  debug?: boolean;
  isOptionClicked?: boolean;
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
    onClick,
    onChange,
    isOptionClicked,
  } = props;
  const [formattedValue, setFormattedValue] = useState(value);
  const [isInternalChange, setIsInternalChange] = useState(false);

  const onFormattedValueChange = useCallback(
    (value?: number | string, roundingMode?: 'ceil' | 'floor' | 'trunc') => {
      if (isNil(value) || value === '') {
        setFormattedValue('');
        return;
      }
      if (isInternalChange && formattedValue === placeholder) {
        setFormattedValue('');
        return;
      }
      const formatted = numberFormat(value, {
        minDigits,
        maxDigits,
        useGrouping,
        roundingMode,
      });
      return setFormattedValue(formatted);
    },
    [formattedValue, maxDigits, minDigits, placeholder, useGrouping, isInternalChange]
  );

  useEffect(() => {
    if (!isInternalChange || isOptionClicked) {
      onFormattedValueChange(value, 'trunc');
      return;
    }
  }, [autoCorrect, isInternalChange, isOptionClicked, value, onFormattedValueChange]);

  const getNumericValue = (value: string) =>
    value
      .replace(/^0+(?!\.|$)/, '')
      .replaceAll(',', '')
      .replace(/[^0-9.]/g, '');

  function isOverMax(newValue?: string | number) {
    return newValue === undefined || isNil(max) || +newValue > max;
  }

  function isUnderMin(newValue?: string | number) {
    return newValue === undefined || isNil(min) || +newValue < min;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const newValue = getNumericValue(event.target.value);

    if (newValue === formattedValue || isNaN(+newValue)) {
      return;
    }

    if (isNil(onChange)) {
      setFormattedValue(newValue);
      return;
    }

    setIsInternalChange(true);

    if (!autoCorrect) {
      setFormattedValue(withComma(newValue));
      onChange(newValue);
      return;
    }

    if (isNotNil(max) && isOverMax(newValue)) {
      onChange(max!.toString());
      setFormattedValue(max!.toString());
    } else if (isNotNil(min) && isUnderMin(newValue)) {
      onChange(min!.toString());
      setFormattedValue(newValue);
    } else {
      onChange(newValue);
      setFormattedValue(newValue);
    }
  }

  function handleBlur() {
    if (autoCorrect && isNotNil(min) && isUnderMin(formattedValue)) {
      onFormattedValueChange(value, 'trunc');
    }
    setIsInternalChange(false);
    return;
  }

  return (
    <>
      <div
        className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className} ${
          error ? 'error' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        {assetSrc ? <Avatar src={assetSrc} size="base" /> : null}

        <input
          type="text"
          className={`text-${align}`}
          value={formattedValue}
          placeholder={placeholder}
          onChange={handleChange}
          onClick={onClick}
          onBlur={handleBlur}
          disabled={disabled}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </>
  );
};
