import "./style.css";

interface CheckboxProps {
  label?: string | number;
  size?: "sm" | "base" | "lg";
  gap?: string;
  className?: string;
  onClick?: () => unknown;
  disabled?: boolean;
  isChecked?: boolean;
}

export const Checkbox = (props: CheckboxProps) => {
  const {
    label,
    size = "base",
    gap = "2",
    className,
    disabled = false,
    isChecked,
  } = props;

  return (
    <div className={`checkbox checkbox-${size} gap-${gap} ${className}`}>
      <input
        className="checkbox-input"
        type="checkbox"
        value=""
        id={`checkbox-${label}`}
        checked={isChecked}
        disabled={disabled}
      />
      <label className="checkbox-label" htmlFor={`checkbox-${label}`}>
        {label}
      </label>
    </div>
  );
};
