import "./style.css";

interface InputProps {
  label?: string;
  value?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  style?: "default" | "active";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Input = ({
  label,
  type,
  size = "base",
  style = "default",
  ...props
}: InputProps) => {
  const value = () => props.value;

  return (
    <input
      type={type}
      className={`input input-${size} input-${style}`}
      value={value()}
      aria-label={label}
    />
  );
};
