import { isNotNil } from 'ramda';
import './style.css';

interface ProgressProps {
  value?: number;
  max?: number;
  css?: 'default' | 'simple';
}

export const Progress = (props: ProgressProps) => {
  const { value, max, css = 'default' } = props;
  const progressPercent = isNotNil(value) && isNotNil(max) ? (value / max) * 100 : 0;

  return (
    <div className={`progress progress-${css} w-full overflow-hidden`}>
      {css === 'default' ? (
        <div className="h-full rounded bg-gray-light">
          <div
            className={`h-full bg-primary dark:bg-gray-dark rounded`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : (
        <div className={`h-full bg-primary rounded`} style={{ width: `${progressPercent}%` }} />
      )}
    </div>
  );
};
