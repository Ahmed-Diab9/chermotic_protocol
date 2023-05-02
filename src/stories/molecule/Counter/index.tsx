import { Button } from "../../atom/Button";
import { Input } from "../../atom/Input";
import "./style.css";

interface CounterProps {
  label: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "sm" | "base" | "lg";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Counter = ({
  label,
  active = false,
  size = "base",
  backgroundColor,
  ...props
}: CounterProps) => {
  return (
    <div className="flex items-stretch gap-2">
      <Button label="-" />
      <Input value="" type="" />
      <Button label="+" />
    </div>
  );
};
