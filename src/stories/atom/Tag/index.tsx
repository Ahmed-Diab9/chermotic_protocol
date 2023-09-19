import './style.css';

interface TagProps {
  label?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  onClick?: () => unknown;
}

export const Tag = (props: TagProps) => {
  const { label, size = 'base', className = '' } = props;

  return <span className={`tag tag-${label} tag-${size} ${className}`}>{label}</span>;
};
