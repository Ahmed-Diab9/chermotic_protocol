import '~/stories/atom/Tabs/style.css';
import './style.css';
import { Button } from '~/stories/atom/Button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';

const BookmarkBoardItems = [{ direction: 'long', name: '', amount: 0.1212 }];

export interface BookmarkBoardProps {}

export const BookmarkBoard = (props: BookmarkBoardProps) => {
  return <div className="BookmarkBoard"></div>;
};
