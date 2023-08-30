import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import '../Button/style.css';

interface BookmarkButtonProps {
  initialBookmarkState?: boolean;
}

export const BookmarkButton = (props: BookmarkButtonProps) => {
  const { initialBookmarkState = false } = props;
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button className="btn-bookmark" onClick={handleBookmarkToggle} title="bookmark toggle">
      <StarIcon
        className={`w-6 h-6 stroke-primary-lighter ${
          isBookmarked ? 'fill-primary stroke-primary' : ''
        }`}
      />
    </button>
  );
};
