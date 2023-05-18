import { InformationCircleIcon } from "@heroicons/react/24/outline";
import "./style.css";

interface TooltipProps {
  label?: string;
  tip?: string;
  // css?: "default" | "active" | "noline" | "circle";
  // size?: "xs" | "sm" | "base" | "lg" | "xl";
  position?: "top" | "right" | "bottom" | "left";
  align?: "center" | "left" | "right";
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  onClick?: () => unknown;
}

export const Tooltip = ({
  label,
  tip,
  // size = "base",
  position = "top",
  align = "center",
  className,
  iconLeft,
  iconOnly,
  iconRight,
  ...props
}: TooltipProps) => {
  return (
    <div className={`tooltip tooltip-${position} ${className}`}>
      {/* {label} */}
      <InformationCircleIcon className="w-4 text-black/30" />
      <span className="tooltip-tip">{tip}</span>
    </div>
  );
};
