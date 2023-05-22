import { Input } from "../Input";
import { Button } from "../Button";
import "../../atom/Input/style.css";
import { ChangeEvent, useState } from "react";
import { bigNumberify } from "../../../utils/number";

interface LeverageOptionProps {
  label?: string;
  value?: string;
  totalValue?: string;
  placeholder?: string;
  assetSrc?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => unknown;
  onButtonClick?: (value: string) => unknown;
}

export const LeverageOption = ({
  label,
  value,
  totalValue,
  placeholder = "0",
  type,
  assetSrc,
  size = "base",
  css = "default",
  align = "right",
  onChange,
  onButtonClick,
  ...props
}: LeverageOptionProps) => {
  const [leverage, setLeverage] = useState<5 | 10 | 15 | 20 | 25 | 30>();
  const onClick = (leverage: 5 | 10 | 15 | 20 | 25 | 30) => {
    const nextValue = bigNumberify(totalValue)?.mul(leverage).toString();
    setLeverage(leverage);
    onButtonClick?.(nextValue ?? "");
  };
  return (
    <div className="flex gap-1">
      <Button
        className="flex-auto"
        label="5x"
        size="sm"
        css={leverage === 5 ? "active" : undefined}
        onClick={() => {
          onClick(5);
        }}
      />
      <Button
        className="flex-auto"
        label="10x"
        size="sm"
        css={leverage === 10 ? "active" : undefined}
        onClick={() => onClick(10)}
      />
      <Button
        className="flex-auto"
        label="15x"
        size="sm"
        css={leverage === 15 ? "active" : undefined}
        onClick={() => onClick(15)}
      />
      <Button
        className="flex-auto"
        label="20x"
        size="sm"
        css={leverage === 20 ? "active" : undefined}
        onClick={() => onClick(20)}
      />
      <Button
        className="flex-auto"
        label="25x"
        size="sm"
        css={leverage === 25 ? "active" : undefined}
        onClick={() => onClick(25)}
      />
      <Button
        className="flex-auto"
        label="30x"
        size="sm"
        css={leverage === 30 ? "active" : undefined}
        onClick={() => onClick(30)}
      />
    </div>
  );
};
