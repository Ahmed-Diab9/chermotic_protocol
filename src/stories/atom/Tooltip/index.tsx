import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import "./style.css";

interface TooltipProps {
  label?: string;
  tip?: string;
  outLink?: string;
  outLinkAbout?: string;
  // size?: "xs" | "sm" | "base" | "lg" | "xl";
  position?: "top" | "right" | "bottom" | "left";
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
    align = "center",
    className,
  } = props;

  return (
    <div className={`tooltip tooltip-${position} ${className} text-black/30`}>
      {label}
      <InformationCircleIcon className="w-4" />
      <div className="tooltip-tip">
        <p>{tip}</p>

        {/* 추후 - 링크 선택 가능하도록 떠있게 설정 추가 */}
        {outLink && (
          <a href={outLink} className="inline-flex">
            Learn more
            {outLinkAbout && `about "${outLinkAbout}"`}
            <ArrowUpRightIcon className="w-3 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
};
