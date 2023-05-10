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
      className={`btn btn-${size} btn-${css} ${className} ${btnIconOnly}`}
      {...props}
    >
      <div className={`flex items-center justify-${align}`}>
        <span>{iconLeft !== undefined ? iconLeft : null}</span>
        <span>{iconOnly !== undefined ? iconOnly : label}</span>
        <span>{iconRight !== undefined ? iconRight : null}</span>
      </div>
    </button>
  );
};
