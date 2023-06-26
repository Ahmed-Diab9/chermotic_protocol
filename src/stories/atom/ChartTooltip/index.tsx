// import "./style.css";
import { PropsWithChildren } from "react";

// FIXME: @dia-nn 더 적절한 이름이 있다면 변경해주세요

// Chart tooltip 공통 컴포넌트 입니다
interface ChartTooltipProps extends PropsWithChildren {}

export const ChartTooltip = (props: ChartTooltipProps) => {
  const { children } = props;

  return <div className={``}>{children}</div>;
};
