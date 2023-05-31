import { Input } from "../Input";
// import { Avatar } from "../Avatar";
import { Button } from "../Button";
import "../../atom/Input/style.css";
import { ChangeEvent, useState } from "react";
import { bigNumberify } from "../../../utils/number";

interface OptionInputProps {
  label?: string;
  value?: string;
  maxValue?: string;
  placeholder?: string;
  assetSrc?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => unknown;
  onButtonClick?: (value: string) => unknown;
}

export const OptionInput = (props: OptionInputProps) => {
  const {
    label,
    value,
    maxValue,
    placeholder = "0",
    type,
    assetSrc,
    size = "base",
    css = "default",
    align = "right",
    className,
    onChange,
    onButtonClick,
  } = props;
  const [ratio, setRatio] = useState<25 | 50 | 75 | 100>();
  const onClick = (ratio: 25 | 50 | 75 | 100) => {
    const nextValue = bigNumberify(maxValue)?.mul(ratio).div(100).toString();
    setRatio(ratio);
    onButtonClick?.(nextValue ?? "");
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {/* <div
        className={`inline-flex gap-3 items-center input input-${size} input-${css}`}
      >
        {assetSrc ? <Avatar className="" src={assetSrc} /> : null}
        <input
          type="number"
          className={`text-${align}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            setRatio(undefined);
            onChange?.(event);
          }}
        />
      </div> */}
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
      />
      <div className="flex gap-1 mt-2">
        {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
        <Button
          className="flex-auto shadow-md shadow-[#797979]/5 border-gray"
          label="25%"
          size="xs"
          css={ratio === 25 ? "active" : undefined}
          onClick={() => {
            onClick(25);
          }}
        />
        <Button
          className="flex-auto shadow-md shadow-[#797979]/5 border-gray"
          label="50%"
          size="xs"
          css={ratio === 50 ? "active" : undefined}
          onClick={() => onClick(50)}
        />
        <Button
          className="flex-auto shadow-md shadow-[#797979]/5 border-gray"
          label="75%"
          size="xs"
          css={ratio === 75 ? "active" : undefined}
          onClick={() => onClick(75)}
        />
        <Button
          className="flex-auto shadow-md shadow-[#797979]/5 border-gray"
          label="Max"
          size="xs"
          css={ratio === 100 ? "active" : undefined}
          onClick={() => onClick(100)}
        />
      </div>
    </div>
  );
};
