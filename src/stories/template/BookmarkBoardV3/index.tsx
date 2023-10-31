import { StarIcon } from '@heroicons/react/20/solid';
import { useBookmarkBoardV3 } from './hooks';
import './style.css';

export interface BookmarkBoardV3Props {}

export const BookmarkBoardV3 = (props: BookmarkBoardV3Props) => {
  const {
    bookmarks = [],
    bookmarkPrices,
    bookmarkClasses,
    isBookmarkLoading,
    onBookmarkClick,
  } = useBookmarkBoardV3();
  return (
    <div className={`BookmarkBoardV3 ${bookmarks.length <= 0 ? 'hidden' : ''}`}>
      <div className="flex items-stretch h-6">
        <StarIcon className="w-4 mr-2" />
        <div className="flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-hide">
          {bookmarks.map((bookmark, index) => (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              key={bookmark.marketAddress}
              href="#"
              className="item-bookmark"
              onClick={(event) => {
                event.preventDefault();
                onBookmarkClick(bookmark);
              }}
            >
              <span>{bookmark.name}</span>
              <span className={bookmarkClasses?.[bookmark.marketAddress]}>
                ${bookmarkPrices?.[bookmark.marketAddress]}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
