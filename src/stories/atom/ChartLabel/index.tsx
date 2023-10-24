import { isNotNil } from 'ramda';
import { SkeletonElement } from '../SkeletonElement';
import './style.css';

interface ChartLabelProps {
  label?: string;
  color?: 'primary' | string;
  translucent?: boolean;
  className?: string;
  thumbClass?: string;
  isLoading?: boolean;
}

export const ChartLabel = (props: ChartLabelProps) => {
  const { label, color = 'primary', translucent, className, thumbClass, isLoading } = props;

  return (
    <SkeletonElement isLoading={isNotNil(isLoading) && isLoading} containerClassName="min-w-[80px]">
      <div className={`flex items-center gap-[6px] ChartLabel ${className}`}>
        <span
          className={`inline-flex w-3 h-3 bg-gradient-to-b from-primary to-primary/10 !from-${color} !to-${color}/10 ${thumbClass} ${
            translucent ? 'opacity-30' : ''
          }`}
        />
        <p className="text-sm leading-none capitalize text-primary-light">{label}</p>
      </div>
    </SkeletonElement>
  );
};
