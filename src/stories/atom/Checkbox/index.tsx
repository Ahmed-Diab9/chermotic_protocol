import "./style.css";

interface CheckboxProps {
  label?: string;
  size?: "sm" | "base" | "lg";
  onClick?: () => unknown;
  disabled?: boolean;
  isChecked?: boolean;
}

export const Checkbox = (props: CheckboxProps) => {
  const { label, size = "base", disabled = false, isChecked } = props;

  return (
    <div className={`checkbox checkbox-${size}`}>
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
