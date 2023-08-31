import '~/stories/atom/Tabs/style.css';
import './style.css';
import { Button } from '~/stories/atom/Button';
import { StarIcon } from '@heroicons/react/20/solid';

const BookmarkBoardItems = [
  { name: 'USDC-ETH/USD', rate: 0.1212 },
  { name: 'USDC-ETH/USD', rate: 0.1212 },
  { name: 'USDC-ETH/USD', rate: -0.1212 },
];

export interface BookmarkBoardProps {}

export const BookmarkBoard = (props: BookmarkBoardProps) => {
  return (
    <div className="mb-2 BookmarkBoard">
      <div className="flex items-stretch h-6">
        <StarIcon className="w-4 mr-3" />
        <div className="flex gap-5">
          {BookmarkBoardItems.map((item, index) => (
            <a key={index} href="" className="item-bookmark">
              <span>{item.name}</span>
              <span
                className={
                  item.rate > 0 ? 'text-price-higher' : item.rate < 0 ? 'text-price-lower' : ''
                }
              >
                {item.rate}%
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
