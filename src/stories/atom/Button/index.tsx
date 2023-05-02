import "./style.css";

interface ButtonProps {
  label: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Button = ({
  label,
  active = false,
  size = "base",
  backgroundColor,
  ...props
}: ButtonProps) => {
  const mode = active ? "btn-active" : "btn-default";
  return (
    <button
      type="button"
      className={`btn btn-${size} ${mode} uppercase`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
