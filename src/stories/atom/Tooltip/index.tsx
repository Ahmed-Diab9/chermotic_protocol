import { Outlink } from "../Outlink";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import "./style.css";

interface TooltipProps {
  label?: string;
  tip?: string;
  outLink?: string;
  outLinkAbout?: string;
  position?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "md" | "lg";
  align?: "center" | "left" | "right";
  className?: string;
  onClick?: () => unknown;
}

export const Tooltip = (props: TooltipProps) => {
  const {
    label,
    tip,
    outLink,
    outLinkAbout,
    position = "top",
    size = "md",
    align = "left",
    className,
  } = props;

  return (
    <div
      className={`tooltip tooltip-${position} ${className} text-black/30 relative self-center ${
        label || "mx-1"
      }`}
    >
      {label}
      <InformationCircleIcon className="w-4" />
      <div className={`tooltip-tip tip-${size} text-${align}`}>
        <p className="text-white">{tip}</p>
        {outLink && (
          <Outlink
            outLink={outLink}
            outLinkAbout={outLinkAbout}
            className="mt-2 !text-white/60"
          />
        )}
      </div>
    </div>
  );
};
