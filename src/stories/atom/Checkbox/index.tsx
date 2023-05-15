import "./style.css";

interface CheckboxProps {
  label?: string;
  size?: "sm" | "base" | "lg";
  className?: string;
  onClick?: () => unknown;
  isChecked?: boolean;
}

export const Checkbox = ({
  size = "base",
  className,
  ...props
}: CheckboxProps) => {
  const label = () => props.label;
  const isChecked = () => props.isChecked;

  return (
    <div className={`checkbox checkbox-${size}`}>
      <input
        className="checkbox-input"
        type="checkbox"
        value=""
        id={`checkbox-${label()}`}
        checked={isChecked()}
        {...props}
      />
      <label className="checkbox-label" htmlFor={`checkbox-${label()}`}>
        {label()}
      </label>
    </div>
  );
};
