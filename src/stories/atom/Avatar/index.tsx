import "./style.css";

interface AvatarProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  disabled?: boolean;
  onClick?: () => unknown;
  image?: string;
}

export const Avatar = ({
  label,
  active = false,
  size = "base",
  backgroundColor,
  ...props
}: AvatarProps) => {
  const image = () => props.image;

  return (
    <div className="avatar">
      <div className="flex items-center gap-3 lg:gap-7">
        <div
          className={`avatar-${size} bg-[#D9D9D9] rounded-full overflow-hidden`}
        >
          {image() !== undefined ? (
            <img src={image()} alt="" className="object-cover w-full h-full" />
          ) : null}
        </div>
      </div>
    </div>
  );
};
