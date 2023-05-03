import "./style.css";

interface ButtonProps {
  label?: string;
  style?: string;
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  onClick?: () => unknown;
}

export const Button = ({
  label,
  style = "default",
  size = "base",
  className,
  iconLeft,
  iconOnly,
  iconRight,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={`btn btn-${size} btn-${style} ${className}`}
      {...props}
    >
      {iconLeft !== undefined ? iconLeft : null}
      {iconOnly !== undefined ? iconOnly : label}
      {iconRight !== undefined ? iconRight : null}
    </button>
  );
};
