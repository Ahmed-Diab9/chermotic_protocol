interface TextRowProps {
  label?: string;
  value?: string;
  subValueLeft?: string;
  subValueRight?: string;
  labelColor?: string;
  labelClass?: string;
  align?: string;
  className?: string;
  onClick?: () => unknown;
}

export const TextRow = (props: TextRowProps) => {
  const {
    label,
    value,
    subValueLeft,
    subValueRight,
    labelColor = "black/30",
    labelClass,
    align = "between",
    className,
  } = props;

  return (
    <div className={`flex justify-${align} ${className}`}>
      <p className={`text-${labelColor} ${labelClass}`}>{label}</p>
      <div className="flex items-center gap-1">
        {subValueLeft && <p className="text-black/30">{subValueLeft}</p>}
        {value}
        {subValueRight && <p className="text-black/30">{subValueLeft}</p>}
      </div>
    </div>
  );
};
