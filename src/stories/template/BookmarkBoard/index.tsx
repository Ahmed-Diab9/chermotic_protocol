import { StarIcon } from '@heroicons/react/20/solid';
import '~/stories/atom/Tabs/style.css';
import { useBookmarkBoard } from './hooks';
import './style.css';

export interface BookmarkBoardProps {}

export const BookmarkBoard = (props: BookmarkBoardProps) => {
  const {
    bookmarks = [],
    bookmarkPrices,
    bookmarkClasses,
    isBookmarkLoading,
    onBookmarkClick,
  } = useBookmarkBoard();
  return (
    <div className={`mb-2 BookmarkBoard ${bookmarks.length <= 0 ? 'hidden' : ''}`}>
      <div className="flex items-stretch h-6">
        <StarIcon className="w-4 mr-3" />
        <div className="flex gap-5">
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
