import "./style.css";

interface AvatarProps {
  label?: string;
  active?: boolean;
  backgroundColor?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl";
  gap?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => unknown;
  src?: string;
}

export const Avatar = ({
  active = false,
  size = "sm",
  fontSize = "base",
  gap = 2,
  className,
  backgroundColor,
  ...props
}: AvatarProps) => {
  const src = () => props.src;
  const label = () => props.label;

  return (
    <div className={`avatar `}>
      <div className={`flex items-center gap-${gap}`}>
        <div
          className={`avatar-${size} bg-[#D9D9D9] rounded-full overflow-hidden shrink-0`}
        >
          {src() ? (
            <img src={src()} alt="" className="object-cover w-full h-full" />
          ) : null}
        </div>
        {label() ? (
          <p className={`text-${fontSize} ${className}`}>{label()}</p>
        ) : null}
      </div>
    </div>
  );
};
