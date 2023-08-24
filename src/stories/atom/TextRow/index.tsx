import { SkeletonElement } from '../SkeletonElement';

interface TextRowProps {
  label?: string;
  value?: string;
  valueClass?: string;
  subValueLeft?: string;
  subValueRight?: string;
  labelClass?: string;
  align?: string;
  className?: string;
  subValueClass?: string;
  isLoading?: boolean;
  onClick?: () => unknown;
}

export const TextRow = (props: TextRowProps) => {
  const {
    label,
    value,
    valueClass = '',
    subValueLeft,
    subValueRight,
    subValueClass,
    labelClass = '',
    align = 'between',
    className = '',
    isLoading,
  } = props;

  return (
    <div className={`flex items-center justify-${align} ${className}`}>
      <p className={`text-primary-lighter ${labelClass}`}>{label}</p>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {subValueLeft && <p className={`text-primary-lighter ${subValueClass}`}>{subValueLeft}</p>}
        <SkeletonElement width={60} isLoading={isLoading}>
          <p className={`${valueClass}`}>{value}</p>
        </SkeletonElement>
        {subValueRight && <p className={`text-primary-lighter ${subValueClass}`}>{subValueLeft}</p>}
      </div>
    </div>
  );
};
