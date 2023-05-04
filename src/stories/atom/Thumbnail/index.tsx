import "./style.css";

interface ThumbnailProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  disabled?: boolean;
  onClick?: () => unknown;
  image?: string;
}

export const Thumbnail = ({
  label,
  active = false,
  size = "base",
  backgroundColor,
  ...props
}: ThumbnailProps) => {
  const image = () => props.image;

  return (
    <div className="thumb">
      <div className="flex items-center gap-3 lg:gap-7">
        <div className={`thumb-${size} bg-[#D9D9D9] overflow-hidden`}>
          {image() !== undefined ? (
            <img src={image()} alt="" className="object-cover w-full h-full" />
          ) : null}{" "}
        </div>
      </div>
    </div>
  );
};
