import { isNil, isNotNil } from 'ramda';
import { ChangeEvent, useState } from 'react';
import { Avatar } from '~/stories/atom/Avatar';
import { withComma } from '~/utils/number';
import './style.css';

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
  withoutComma?: boolean;
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
    withoutComma = false,
    onChange,
  } = props;

  const [tempValue, setTempValue] = useState(value);
  const [isInternalChange, setIsInternalChange] = useState(false);

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
    setIsInternalChange(true);
    const newValue = trimLeadingZero(event.target.value)
      .replaceAll(',', '')
      .replace(/[^0-9.]/g, '');

    if (newValue === tempValue || isNaN(+newValue)) {
      return;
    }

    if (isNil(onChange)) {
      setTempValue(newValue);
      return;
    }

    if (!autoCorrect) {
      setTempValue(newValue);
      onChange(newValue);
      return;
    }

    if (isNotNil(max) && isOverMax(newValue)) {
      onChange(max!.toString());
      setTempValue(max!.toString());
    } else if (isNotNil(min) && isUnderMin(newValue)) {
      onChange(min!.toString());
      setTempValue(newValue);
    } else {
      onChange(newValue);
      setTempValue(newValue);
    }
  }

  function handleBlur() {
    if (tempValue === undefined || String(tempValue).length === 0) {
      setIsInternalChange(false);
    }
    if (autoCorrect && isNotNil(min) && isUnderMin(tempValue)) {
      setTempValue(value);
      return;
    }
    if (isNotNil(onChange) && isNotNil(tempValue)) {
      setTempValue(String(+tempValue));
      return;
    }
  }

  return (
    <>
      <div
        className={`inline-flex gap-1 items-center input input-${size} input-${css} ${className} ${
          isInternalChange && error ? 'error' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        {assetSrc ? <Avatar src={assetSrc} size="sm" /> : null}

        <input
          type="text"
          className={`text-${align}`}
          value={withoutComma ? tempValue : withComma(tempValue)}
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
