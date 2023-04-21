import "./style.css";

interface ButtonProps {
  active?: boolean;
  backgroundColor?: string;
  size?: "sm" | "md" | "lg";
  label: string;
  onClick?: () => void;
}

export const Button = ({
  active = false,
  size = "md",
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const mode = active ? "btn-active" : "btn-default";
  return (
    <button
      type="button"
      className={`btn btn-${size} ${mode}`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
