import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

interface BookmarkButtonProps {
  initialBookmarkState?: boolean;
  size?: 'base' | 'lg' | 'sm';
  className?: string;
}

export const BookmarkButton = (props: BookmarkButtonProps) => {
  const { initialBookmarkState = false, size = 'base', className } = props;
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button
      className={`btn-bookmark ${className}`}
      onClick={handleBookmarkToggle}
      title="bookmark toggle"
    >
      <StarIcon
        className={`stroke-primary-lighter ${isBookmarked ? 'fill-primary stroke-primary' : ''}    
        ${size === 'base' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : size === 'sm' ? '' : ''}
          `}
      />
    </button>
  );
};
