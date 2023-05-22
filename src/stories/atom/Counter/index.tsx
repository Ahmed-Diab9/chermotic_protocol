import { useState } from "react";
import { Button } from "../Button";
// import { Input } from "../../atom/Input";
import { MinusIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";
import "./style.css";

interface CounterProps {
  label?: string;
  size?: "sm" | "base" | "lg";
  disabled?: boolean;
  value?: number | string;
  symbol?: string;
  onClick?: () => unknown;
  onIncrement?: () => unknown;
  onDecrement?: () => unknown;
}

export const Counter = (props: CounterProps) => {
  const { value, symbol, onIncrement, onDecrement } = props;

  return (
    <div className="flex w-full items-stretch justify-stretch gap-0">
      <Button onClick={onDecrement} label="minus" iconOnly={<MinusIcon />} />
      <div className="flex w-full items-center justify-center">
        <h5 className="text-center">
          {typeof value === "number" ? value?.toFixed(2) : value}
          {symbol}
        </h5>
      </div>
      <Button onClick={onIncrement} label="plus" iconOnly={<PlusIcon />} />
    </div>
  );
};
