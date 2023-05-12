import "./style.css";

interface ThumbnailProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  disabled?: boolean;
  onClick?: () => unknown;
  src?: string;
}

export const Thumbnail = ({
  label,
  active = false,
  size = "base",
  backgroundColor,
  ...props
}: ThumbnailProps) => {
  const src = () => props.src;

  return (
    <div className="thumb">
      <div className="flex items-center gap-3 lg:gap-7">
        <div className={`thumb-${size} bg-[#D9D9D9] overflow-hidden`}>
          {src() !== undefined ? (
            <img src={src()} alt="" className="object-cover w-full h-full" />
          ) : null}{" "}
        </div>
      </div>
    </div>
  );
};
