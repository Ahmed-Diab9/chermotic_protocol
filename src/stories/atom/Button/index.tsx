import "./style.css";

interface ButtonProps {
  label?: string;
  css?: string;
  size?: "xs" | "sm" | "base" | "lg";
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
      className={`btn btn-${size} btn-${css} ${className} ${btnIconOnly}`}
      {...props}
    >
      {iconLeft !== undefined ? iconLeft : null}
      {iconOnly !== undefined ? iconOnly : label}
      {iconRight !== undefined ? iconRight : null}
    </button>
  );
};
