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
      <div className={`flex items-center gap-1 text-${size}`}>
        {iconLeft !== undefined ? iconLeft : null}
        <p className="grow">{iconOnly !== undefined ? iconOnly : label}</p>
        {iconRight !== undefined ? iconRight : null}
      </div>
    </button>
  );
};
