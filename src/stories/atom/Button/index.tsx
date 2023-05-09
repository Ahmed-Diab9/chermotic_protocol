import "./style.css";

interface ButtonProps {
  label?: string;
  css?: string;
  size?: "xs" | "sm" | "base" | "lg";
  align?: "center" | "left" | "right";
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  onClick?: () => unknown;
}

export const Button = ({
  label,
  css = "default",
  size = "base",
  align = "center",
  className,
  iconLeft,
  iconOnly,
  iconRight,
  ...props
}: ButtonProps) => {
  const btnIconOnly = iconOnly ? "btn-icon-only" : "";

  return (
    <button
      type="button"
      className={`btn btn-${size} btn-${css} align-${align} ${className} ${btnIconOnly}`}
      {...props}
    >
      {iconLeft !== undefined ? iconLeft : null}
      {iconOnly !== undefined ? iconOnly : label}
      {iconRight !== undefined ? iconRight : null}
    </button>
  );
};
