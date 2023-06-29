import './style.css';
import { PropsWithChildren } from 'react';
import { Tooltip, ITooltip } from 'react-tooltip';
import { shift, Middleware } from '@floating-ui/dom';

interface ChartTooltipProps extends PropsWithChildren {
  anchor: string;
  className?: string;
  onClick?: () => unknown;
  offset?: number;
  render?: ITooltip['render'];
}

export const ChartTooltip = (props: ChartTooltipProps) => {
  const { anchor, className, offset = 12, render } = props;

  const fixToBottom: Middleware = {
    name: 'fixToBottom',
    fn({ x, y, elements, platform }) {
      if (!elements.reference) return { x, y };
      const slot = platform.getOffsetParent?.(elements.reference);
      const bottom = (slot?.getBoundingClientRect().bottom ?? 0) + window.scrollY;

      return {
        x,
        y: bottom + offset,
      };
    },
  };

  return (
    <div className="chart-tooltip">
      <Tooltip
        middlewares={[shift(), fixToBottom]}
        anchorSelect={anchor}
        className={`z-50 !bg-white border border-black !rounded-lg min-w-[200px] ${
          className ? className : ''
        }`}
        place="bottom"
        render={render}
        positionStrategy="absolute"
        // isOpen
      />
    </div>
  );
};
