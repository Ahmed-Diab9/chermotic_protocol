import "./style.css";

interface InputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  size?: "sm" | "base" | "lg";
  css?: "default" | "active";
  align?: "center" | "left" | "right";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Input = ({
  label,
  placeholder,
  type,
  className,
  size = "base",
  css = "default",
  align = "left",
  ...props
}: InputProps) => {
  const value = () => props.value;

  return (
    <input
      type={type}
      className={`input input-${size} input-${css} text-${align} ${className}}`}
      value={value()}
      placeholder={placeholder}
      aria-label={label}
    />
  );
};
