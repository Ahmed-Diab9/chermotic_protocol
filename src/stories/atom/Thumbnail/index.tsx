import './style.css';

interface ThumbnailProps {
  // label?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  onClick?: () => unknown;
  src?: string;
}

export const Thumbnail = (props: ThumbnailProps) => {
  const { size = 'base', className = '' } = props;
  const src = () => props.src;

  return (
    <span
      className={`thumb thumb-${size} bg-[#D9D9D9] dark:bg-[#696974] overflow-hidden ${className}`}
    >
      {src() !== undefined ? (
        <img src={src()} alt="" className="object-cover w-full h-full" />
      ) : null}{' '}
    </span>
  );
};
