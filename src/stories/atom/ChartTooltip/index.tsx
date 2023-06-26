import "./style.css";
import { Tooltip } from "react-tooltip";
import { Token } from "../../../typings/market";

import { PropsWithChildren } from "react";

interface ChartTooltipProps extends PropsWithChildren {
  label?: string;
  token?: Token;
  makerMargin?: string;
  binPercent?: number;
  liquidity?: number;
  utilization?: number;
  className?: string;
  selected?: boolean;
  onClick?: () => unknown;
}

export const ChartTooltip = (props: ChartTooltipProps) => {
  const {
    children,
    label,
    token,
    makerMargin,
    binPercent,
    liquidity,
    utilization,
    className,
    selected,
  } = props;

  return (
    <div className="chart-tooltip">
      {/* todo: className "chart-tooltip-${label}" 을 chart 내 영역에 동일하게 적용해야함 */}
      <span
        className={` self-center mx-1 chart-tooltip-${label} tooltip-icon ${className}`}
      >
        bin
      </span>
      <Tooltip
        anchorSelect={`.chart-tooltip-${label}`}
        className={`z-50 !bg-white border border-black !rounded-lg min-w-[200px]`}
        place="bottom"
        // isOpen
      >
        {selected ? (
          // 선택된 영역 마우스오버시, Maker Margin 정보 보임
          <div className={``}>
            <p className="font-semibold text-black">
              Maker Margin: {makerMargin} {token?.name}
            </p>
          </div>
        ) : (
          <div className={``}>
            <p className="font-semibold text-black">
              Liquidity Bin {binPercent}%
            </p>
            <div className="flex flex-col gap-1 mt-2 text-sm font-semibold text-black/30">
              <p>
                Liquidity: {liquidity} {token?.name}
              </p>
              <p>
                Utilization: {utilization} {token?.name} (
                {(utilization / liquidity) * 100}%)
              </p>
            </div>
          </div>
        )}
      </Tooltip>
    </div>
  );
};
