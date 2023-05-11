import { useState } from "react";
import { Button } from "../Button";
// import { Input } from "../../atom/Input";
import { MinusIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";
import "./style.css";

interface CounterProps {
  label?: string;
  count?: number;
  size?: "sm" | "base" | "lg";
  width?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  initialValue?: number;
}

export const Counter = ({
  label,
  size = "base",
  width,
  initialValue = 0,
  ...props
}: CounterProps) => {
  const [count, setCount] = useState<number>(initialValue);
  const increment = () => {
    setCount(count + 0.1);
  };
  const decrement = () => {
    setCount(count - 0.1);
  };

  return (
    <div className="flex items-stretch gap-0">
      <Button onClick={decrement} label="minus" iconOnly={<MinusIcon />} />
      <input
        type="number"
        value={count.toFixed(2)}
        onChange={() => {}}
        title="counter"
        className={`text-center w-[${width}]`}
      />
      <Button onClick={increment} label="plus" iconOnly={<PlusIcon />} />
    </div>
  );
};
