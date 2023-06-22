import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

interface OutlinkProps {
  label?: string;
  outLink?: string;
  outLinkAbout?: string;
  color?: "white" | "black";
  className?: string;
  onClick?: () => unknown;
}

export const Outlink = (props: OutlinkProps) => {
  const {
    label = "Learn more",
    outLink,
    outLinkAbout,
    color = "white",
    className,
  } = props;

  return (
    <a
      href={outLink}
      className={`inline-flex ${className} text-${
        color === "white" ? "white/60" : "black/50"
      }`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="self-center text-sm font-semibold hover:underline">
        <p className="inline">
          {label}
          {outLinkAbout && ` about "${outLinkAbout}"`}
        </p>
        <ArrowUpRightIcon className="inline w-3 ml-1" />
      </div>
    </a>
  );
};
