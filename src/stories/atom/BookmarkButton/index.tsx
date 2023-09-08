import { StarIcon } from '@heroicons/react/24/outline';

interface BookmarkButtonProps {
  isMarked?: boolean;
  size?: 'base' | 'lg' | 'sm';
  className?: string;
  onClick?: () => unknown;
}

export const BookmarkButton = (props: BookmarkButtonProps) => {
  const { isMarked = false, size = 'base', className, onClick } = props;

  return (
    <button className={`btn-bookmark ${className}`} onClick={onClick} title="bookmark toggle">
      <StarIcon
        className={`stroke-primary-lighter ${isMarked ? 'fill-primary stroke-primary' : ''}    
        ${size === 'base' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : size === 'sm' ? '' : ''}
          `}
      />
    </button>
  );
};
