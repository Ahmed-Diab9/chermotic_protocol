import { Input } from "../Input";
import { Button } from "../Button";
import "../../atom/Input/style.css";

interface OptionInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  assetSrc?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const OptionInput = ({
  label,
  placeholder = "0",
  type,
  assetSrc,
  size = "base",
  css = "default",
  align = "right",
  ...props
}: OptionInputProps) => {
  return (
    <div className="inline-flex flex-col">
      <Input
        label={label}
        placeholder={placeholder}
        assetSrc={assetSrc}
        type={type}
        size={size}
        css={css}
        align={align}
      />
      <div className="flex gap-1 mt-2">
        {/* 버튼 누르면 값이 input에 입력되면서 active 상태됨, input value가 바뀌면 active 해제됨 */}
        <Button className="flex-auto" label="25%" size="sm" css="active" />
        <Button className="flex-auto" label="50%" size="sm" />
        <Button className="flex-auto" label="75%" size="sm" />
        <Button className="flex-auto" label="Max" size="sm" />
      </div>
    </div>
  );
};
