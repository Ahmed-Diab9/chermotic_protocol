import { Input } from "../Input";
import { Button } from "../Button";
import "../../atom/Input/style.css";

interface LeverageOptionProps {
  label?: string;
  value?: number;
  totalValue?: string;
  placeholder?: string;
  assetSrc?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: (nextValue: number) => unknown;
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
  onClick,
}: LeverageOptionProps) => {
  return (
    <div className="flex gap-1">
      <Button
        className="flex-auto"
        label="5x"
        size="sm"
        css={value === 5 ? "active" : undefined}
        onClick={() => {
          onClick?.(5);
        }}
      />
      <Button
        className="flex-auto"
        label="10x"
        size="sm"
        css={value === 10 ? "active" : undefined}
        onClick={() => onClick?.(10)}
      />
      <Button
        className="flex-auto"
        label="15x"
        size="sm"
        css={value === 15 ? "active" : undefined}
        onClick={() => onClick?.(15)}
      />
      <Button
        className="flex-auto"
        label="20x"
        size="sm"
        css={value === 20 ? "active" : undefined}
        onClick={() => onClick?.(20)}
      />
      <Button
        className="flex-auto"
        label="25x"
        size="sm"
        css={value === 25 ? "active" : undefined}
        onClick={() => onClick?.(25)}
      />
      <Button
        className="flex-auto"
        label="30x"
        size="sm"
        css={value === 30 ? "active" : undefined}
        onClick={() => onClick?.(30)}
      />
    </div>
  );
};
