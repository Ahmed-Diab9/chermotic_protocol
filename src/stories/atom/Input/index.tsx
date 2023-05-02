import "./style.css";

interface InputProps {
  label?: string;
  value?: string;
  type?: string;
  size?: "sm" | "base" | "lg";
  disabled?: boolean;
  onClick?: () => unknown;
}

export const Input = ({ label, type, size = "base", ...props }: InputProps) => {
  const value = () => props.value;

  return (
    <input type={type} className="input" value={value()} aria-label={label} />
  );
};
