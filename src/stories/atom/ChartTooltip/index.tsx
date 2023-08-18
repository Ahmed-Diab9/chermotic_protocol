import '../TooltipGuide/style.css';
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
  const { anchor, className = '', offset = 5, render } = props;

  const fixToTop: Middleware = {
    name: 'fixToTop',
    fn({ x, y, elements }) {
      if (!elements.floating) return { x, y };
      const height = elements.floating.getBoundingClientRect().height;
      return {
        x,
        y: -height - offset,
      };
    },
  };

  return (
    <div className="tooltip chart-tooltip" style={{ position: 'absolute' }}>
      <Tooltip
        middlewares={[shift(), fixToTop]}
        anchorSelect={anchor}
        className={`tooltip-outline min-w-[200px] ${className}`}
        place="top"
        render={render}
        positionStrategy="absolute"
      />
    </div>
  );
};
