import './style.css';
import { Tooltip } from 'react-tooltip';
import { PropsWithChildren, ReactNode } from 'react';

interface ChartTooltipProps extends PropsWithChildren {
  label: number | string;
  tip: ReactNode;
  className?: string;
  onClick?: () => unknown;
}

export const ChartTooltip = (props: ChartTooltipProps) => {
  const { children, label, tip, className } = props;

  return (
    <div className="chart-tooltip">
      {/* todo: className "chart-tooltip-${label}" 을 chart 내 hover 영역에 동일하게 적용해야함 */}
      {/* 아래 span은 임시로 넣어둠 */}
      <span className={`self-center chart-tooltip-${label} ${className}`}>bin</span>
      <Tooltip
        anchorSelect={`.chart-tooltip-${label}`}
        className={`z-50 !bg-white border border-black !rounded-lg min-w-[200px]`}
        place="bottom"
        // isOpen
      >
        <div className="text-black">{tip}</div>
      </Tooltip>
    </div>
  );
};
