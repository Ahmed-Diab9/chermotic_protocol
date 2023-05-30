import { MouseEventHandler } from "react";
import "./style.css";

interface ButtonProps {
  label?: string;
  css?: "default" | "active" | "noline" | "circle";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  align?: "center" | "left" | "right";
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = (props: ButtonProps) => {
  const {
    label,
    css = "default",
    size = "base",
    align = "center",
    className,
    iconLeft,
    iconOnly,
    iconRight,
    disabled = false,
    onClick,
  } = props;
  const btnIconOnly = iconOnly ? "btn-icon-only" : "";

  return (
    <button
      type="button"
      className={`btn btn-${size} btn-${css} ${className} ${btnIconOnly}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className={`flex items-center gap-1 justify-${align}`}>
        {iconLeft !== undefined ? iconLeft : null}
        {iconOnly !== undefined ? iconOnly : label}
        {iconRight !== undefined ? iconRight : null}
      </div>
    </button>
  );
};
