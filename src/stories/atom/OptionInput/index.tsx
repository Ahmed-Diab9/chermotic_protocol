import { Input } from '../Input';
// import { Avatar } from "../Avatar";
import { Button } from '../Button';
import '../../atom/Input/style.css';
import { ChangeEvent, useState } from 'react';

interface OptionInputProps {
  label?: string;
  value?: string | number;
  maxValue?: string | number;
  placeholder?: string;
  assetSrc?: string;
  type?: string;
  size?: 'sm' | 'base' | 'lg';
  css?: 'default' | 'active';
  align?: 'center' | 'left' | 'right';
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  onChange?: (value: string) => unknown;
  onButtonClick?: (value: string) => unknown;
  onClickAway?: () => unknown;
}

export const OptionInput = (props: OptionInputProps) => {
  const {
    label,
    value,
    maxValue,
    placeholder = '0',
    type,
    assetSrc,
    size = 'base',
    css = 'default',
    align = 'right',
    className,
    onChange,
    onButtonClick,
    onClickAway,
  } = props;
  const [ratio, setRatio] = useState<25 | 50 | 75 | 100>();
  const onClick = (ratio: 25 | 50 | 75 | 100) => {
    const nextValue = (Number(maxValue) * (ratio / 100)).toString();
    setRatio(ratio);
    onButtonClick?.(nextValue ?? '');
  };

  return (
    <div className={`inline-flex flex-col-reverse ${className}`}>
      <div className="flex gap-1 mt-2">
        {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
        <Button
          className="flex-auto shadow-base"
          label="25%"
          size="sm"
          css={ratio === 25 ? 'active' : 'gray'}
          onClick={() => {
            onClick(25);
          }}
        />
        <Button
          className="flex-auto shadow-base"
          label="50%"
          size="sm"
          css={ratio === 50 ? 'active' : 'gray'}
          onClick={() => onClick(50)}
        />
        <Button
          className="flex-auto shadow-base"
          label="75%"
          size="sm"
          css={ratio === 75 ? 'active' : 'gray'}
          onClick={() => onClick(75)}
        />
        <Button
          className="flex-auto shadow-base"
          label="Max"
          size="sm"
          css={ratio === 100 ? 'active' : 'gray'}
          onClick={() => onClick(100)}
        />
      </div>
      <Input
        label={label}
        placeholder={placeholder}
        assetSrc={assetSrc}
        type={type}
        size={size}
        css={css}
        align={align}
        value={value}
        onChange={(event) => {
          setRatio(undefined);
          onChange?.(event);
        }}
        className="relative border-gray"
        onClickAway={onClickAway}
      />
    </div>
  );
};
