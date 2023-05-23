import "./style.css";

interface TagProps {
  label?: string;
  css?: "default" | "active" | "noline" | "circle";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  align?: "center" | "left" | "right";
  className?: string;
  iconLeft?: any;
  iconOnly?: any;
  iconRight?: any;
  onClick?: () => unknown;
}

export const Tag = ({
  label,
  css = "default",
  size = "base",
  align = "center",
  className,
  iconLeft,
  iconOnly,
  iconRight,
  ...props
}: TagProps) => {
  return <span className={`tag tag-${label}`}>{label}</span>;
};
