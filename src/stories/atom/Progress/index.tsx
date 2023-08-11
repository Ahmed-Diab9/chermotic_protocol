import { isValid } from '~/utils/valid';
import './style.css';

interface ProgressProps {
  value?: number;
  max?: number;
  css?: 'default' | 'sm';
}

export const Progress = (props: ProgressProps) => {
  const { value, max, css = 'default' } = props;
  const progressPercent = isValid(value) && isValid(max) ? (value / max) * 100 : 0;

  return (
    <div className={`progress progress-${css} w-full overflow-hidden rounded`}>
      {css === 'sm' ? (
        <div className="h-full rounded bg-gray-light">
          <div className={`h-full bg-primary rounded`} style={{ width: `${progressPercent}%` }} />
        </div>
      ) : (
        <div className={`h-full bg-primary rounded`} style={{ width: `${progressPercent}%` }} />
      )}
    </div>
  );
};
