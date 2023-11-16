import '~/stories/atom/Input/style.css';

import { isNotNil } from 'ramda';
import { useState } from 'react';

import { Button } from '~/stories/atom/Button';
import { Input } from '~/stories/atom/Input';

interface OptionInputProps {
  label?: string;
  value?: string | number;
  maxValue?: string | number;
  placeholder?: string;
  assetSrc?: string;
  size?: 'sm' | 'base' | 'lg';
  css?: 'default' | 'active';
  itemsAlign?: 'center' | 'start' | 'end' | 'stretch';
  inputAlign?: 'center' | 'left' | 'right';
  direction?: 'row' | 'column';
  className?: string;
  disabled?: boolean;
  error?: boolean;
  errorMsg?: string | undefined;
  errorMsgAlign?: 'left' | 'center' | 'right';
  onClick?: () => unknown;
  onChange?: (value: string, hasMax?: boolean) => unknown;
}

export const OptionInput = (props: OptionInputProps) => {
  const {
    label,
    value,
    maxValue,
    placeholder = '0',
    assetSrc,
    size = 'base',
    css = 'default',
    itemsAlign = 'end',
    inputAlign = 'right',
    direction = 'column',
    className = '',
    disabled = false,
    error = false,
    errorMsg,
    errorMsgAlign = 'right',
    onChange,
  } = props;
  const [ratio, setRatio] = useState<number>();
  const [isOptionClicked, setIsOptionClicked] = useState(false);

  const onClick = (ratio: 25 | 50 | 75 | 100) => () => {
    setRatio(ratio);
    setIsOptionClicked(true);
    if (ratio === 100) {
      onChange?.(String(maxValue || ''), true);
    } else {
      const nextValue = Number(maxValue) * (ratio / 100);
      onChange?.(String(nextValue || ''));
    }
  };

  const onChangeInput = (value: string) => {
    if (isNotNil(ratio)) {
      setRatio(undefined);
    }
    onChange?.(value);
    setIsOptionClicked(false);
  };

  return (
    <div className={`flex flex-col items-${itemsAlign} ${className}`}>
      {errorMsg && <p className={`mb-2 text-price-lower text-${errorMsgAlign}`}>{errorMsg}</p>}
      <div
        className={`flex ${
          direction === 'row'
            ? 'items-center justify-between w-full gap-3'
            : 'flex-col-reverse items-stretch gap-2'
        }`}
      >
        <div className="flex gap-1">
          <Button
            className="flex-auto shadow-base !text-lg !px-2"
            label="25%"
            size="sm"
            css={ratio === 25 ? 'active' : 'default'}
            onClick={onClick(25)}
          />
          <Button
            className="flex-auto shadow-base !text-lg !px-2"
            label="50%"
            size="sm"
            css={ratio === 50 ? 'active' : 'default'}
            onClick={onClick(50)}
          />
          <Button
            className="flex-auto shadow-base !text-lg !px-2"
            label="75%"
            size="sm"
            css={ratio === 75 ? 'active' : 'default'}
            onClick={onClick(75)}
          />
          <Button
            className="flex-auto shadow-base !text-lg !px-2"
            label="Max"
            size="sm"
            css={ratio === 100 ? 'active' : 'default'}
            onClick={onClick(100)}
          />
        </div>
        <Input
          label={label}
          placeholder={placeholder}
          assetSrc={assetSrc}
          size={size}
          css={css}
          align={inputAlign}
          value={value}
          onChange={onChangeInput}
          className="relative border-gray-light"
          disabled={disabled}
          error={error}
          isOptionClicked={isOptionClicked}
          debug
        />
      </div>
    </div>
  );
};
