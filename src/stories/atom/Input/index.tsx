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

export const Input = (props: InputProps) => {
  const {
    placeholder,
    assetSrc,
    unit,
    type = "number",
    className,
    size = "base",
    css = "default",
    align = "left",
    value,
    onChange,
  } = props;

  return (
    <div
      className={`inline-flex gap-3 items-center input input-${size} input-${css} ${className}`}
    >
      {assetSrc ? <Avatar className="" src={assetSrc} /> : null}
      <input
        type={type}
        className={`text-${align}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          event.preventDefault();
          onChange && onChange(event);
        }}
      />
      {unit ? <span className="text-black/30">{unit}</span> : null}
    </div>
  );
};
