import { ChangeEvent, useState } from "react";
import { Avatar } from "../Avatar";
import "./style.css";

interface InputProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  assetSrc?: string;
  unit?: string;
  type?: string;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => unknown;
}

export const Input = ({
  label,
  placeholder,
  assetSrc,
  unit,
  type,
  // className,
  size = "base",
  css = "default",
  align = "left",
  value,
  onChange,
  ...props
}: InputProps) => {
  return (
    <div
      className={`inline-flex gap-3 items-center input input-${size} input-${css}`}
    >
      {assetSrc && <Avatar className="" src={assetSrc} />}
      <input
        type="number"
        className={`text-${align}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          event.preventDefault();
          onChange && onChange(event);
        }}
      />
      {unit && <span className="text-black/30">{unit}</span>}
    </div>
  );
};
