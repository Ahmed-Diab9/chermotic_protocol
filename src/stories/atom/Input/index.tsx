import "./style.css";

interface InputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  style?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Input = ({
  label,
  placeholder,
  type,
  size = "base",
  style = "default",
  align = "left",
  ...props
}: InputProps) => {
  const value = () => props.value;

  return (
    <input
      type={type}
      className={`input input-${size} input-${style} text-${align}`}
      value={value()}
      placeholder={placeholder}
      aria-label={label}
    />
  );
};
