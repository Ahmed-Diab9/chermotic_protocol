import './style.css';

interface CheckboxProps {
  label: string | number;
  title?: string;
  size?: 'sm' | 'base' | 'lg';
  gap?: string;
  className?: string;
  onClick?: () => unknown;
  disabled?: boolean;
  isChecked?: boolean;
}

export const Checkbox = (props: CheckboxProps) => {
  const {
    label,
    title,
    size = 'base',
    gap = '2',
    className = '',
    disabled = false,
    isChecked,
    onClick,
  } = props;

  return (
    <div className={`checkbox checkbox-${size} ${className}`}>
      <input
        className="checkbox-input"
        type="checkbox"
        value=""
        id={`checkbox-${label}`}
        checked={isChecked}
        disabled={disabled}
        onChange={onClick}
      />
      <label className={`checkbox-label gap-${gap}`} htmlFor={`checkbox-${label}`}>
        {title}
      </label>
    </div>
  );
};
