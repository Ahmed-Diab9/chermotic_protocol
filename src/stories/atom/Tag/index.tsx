import './style.css';

interface TagProps {
  label?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  css?: string;
  className?: string;
  onClick?: () => unknown;
}

export const Tag = (props: TagProps) => {
  const { label, size = 'base', css, className = '' } = props;

  return (
    <span className={`tag tag-${size} ${css ? `tag-${css}` : `tag-${label}`} ${className}`}>
      {label}
    </span>
  );
};
