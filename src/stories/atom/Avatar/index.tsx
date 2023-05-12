import "./style.css";

interface AvatarProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  src?: string;
}

export const Avatar = ({
  label,
  active = false,
  size = "base",
  className,
  backgroundColor,
  ...props
}: AvatarProps) => {
  const src = () => props.src;

  return (
    <div className={`avatar ${className}`}>
      <div className="flex items-center gap-3 lg:gap-7">
        <div
          className={`avatar-${size} bg-[#D9D9D9] rounded-full overflow-hidden`}
        >
          {src() !== undefined ? (
            <img src={src()} alt="" className="object-cover w-full h-full" />
          ) : null}
        </div>
      </div>
    </div>
  );
};
