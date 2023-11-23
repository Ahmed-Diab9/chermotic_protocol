import { isNotNil } from 'ramda';
import { SkeletonElement } from '../SkeletonElement';
import './style.css';

interface ChartLabelProps {
  label?: string;
  translucent?: boolean;
  className?: string;
  thumbClass?: string;
  isLoading?: boolean;
}

export const ChartLabel = (props: ChartLabelProps) => {
  const { label, translucent, className, thumbClass, isLoading } = props;

  return (
    <SkeletonElement isLoading={isNotNil(isLoading) && isLoading} width={80}>
      <div className={`flex items-center gap-[6px] ChartLabel ${className}`}>
        <span
          className={`inline-flex w-3 h-3 bg-gradient-to-b from- ${thumbClass} ${
            translucent ? `opacity-30 from-primary/50 to-primary/30` : `from-primary to-primary/10`
          }`}
        />
        <p className="text-sm leading-none text-primary-light">{label}</p>
      </div>
    </SkeletonElement>
  );
};
