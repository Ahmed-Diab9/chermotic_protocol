import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import "../../atom/Input/style.css";

interface AssetInputProps {
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

export const AssetInput = ({
  label,
  placeholder = "0",
  type,
  assetSrc,
  size = "base",
  css = "default",
  align = "right",
  ...props
}: AssetInputProps) => {
  const value = () => props.value;

  return (
    <div className="inline-flex flex-col">
      <div
        className={`inline-flex gap-3 items-center input input-${size} input-${css}`}
      >
        {assetSrc ? <Avatar className="" src={assetSrc} /> : null}
        <input
          type="number"
          className={`text-${align}`}
          value={value()}
          placeholder={placeholder}
        />
      </div>
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
