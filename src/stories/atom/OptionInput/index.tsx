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
  align?: 'center' | 'left' | 'right';
  flex?: boolean;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  onClick?: () => unknown;
  onChange?: (value: string) => unknown;
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
    align = 'right',
    flex,
    className = '',
    disabled = false,
    error = false,
    onChange,
  } = props;
  const [ratio, setRatio] = useState<number>();

  const onClick = (ratio: 25 | 50 | 75 | 100) => () => {
    setRatio(ratio);
    if (ratio === 100) {
      onChange?.(String(maxValue || ''));
    } else {
      const nextValue = Number(maxValue) * (ratio / 100);
      onChange?.(String(nextValue || ''));
    }
  };

  const onChangeInput = (value: string) => {
    if (isNotNil(ratio)) setRatio(undefined);
    onChange?.(value);
  };

  return (
    <div
      className={`flex gap-2 ${className} ${
        flex ? 'items-center justify-between w-full' : 'flex-col-reverse items-stretch'
      }`}
    >
      <div className="flex gap-1">
        {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
        <Button
          className="flex-auto shadow-base !text-lg"
          label="25%"
          size="sm"
          css={ratio === 25 ? 'active' : 'default'}
          onClick={onClick(25)}
        />
        <Button
          className="flex-auto shadow-base !text-lg"
          label="50%"
          size="sm"
          css={ratio === 50 ? 'active' : 'default'}
          onClick={onClick(50)}
        />
        <Button
          className="flex-auto shadow-base !text-lg"
          label="75%"
          size="sm"
          css={ratio === 75 ? 'active' : 'default'}
          onClick={onClick(75)}
        />
        <Button
          className="flex-auto shadow-base !text-lg"
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
        align={align}
        value={value}
        onChange={onChangeInput}
        className="relative border-gray-light"
        disabled={disabled}
        error={error}
        debug
      />
    </div>
  );
};
