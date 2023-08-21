import Skeleton from 'react-loading-skeleton';
import { SkeletonElement } from '../SkeletonElement';

interface TextRowProps {
  label?: string;
  value?: string;
  subValueLeft?: string;
  subValueRight?: string;
  labelClass?: string;
  align?: string;
  className?: string;
  isLoading?: boolean;
  onClick?: () => unknown;
}

export const TextRow = (props: TextRowProps) => {
  const {
    label,
    value,
    subValueLeft,
    subValueRight,
    labelClass = '',
    align = 'between',
    className = '',
    isLoading,
  } = props;

  return (
    <div className={`flex items-center justify-${align} ${className}`}>
      <p className={`text-primary-lighter ${labelClass}`}>{label}</p>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {subValueLeft && <p className="text-primary-lighter">{subValueLeft}</p>}
        <SkeletonElement width={60} isLoading={isLoading}>
          {value}
        </SkeletonElement>
        {subValueRight && <p className="text-primary-lighter">{subValueLeft}</p>}
      </div>
    </div>
  );
};
