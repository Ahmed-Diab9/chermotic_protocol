import { Progress } from '~/stories/atom/Progress';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import { Tag } from '~/stories/atom/Tag';
import '~/stories/atom/Tabs/style.css';

export interface PoolMenuProps {}

export const PoolMenu = (props: PoolMenuProps) => {
  return (
    <div className="flex flex-col gap-1 PoolMenu">
      <PoolMenuItem label="high" title="Junior Pool" price={100} aum={50} selected />
      <PoolMenuItem label="mid" title="Mezzanine Pool" price={100} aum={50} />
      <PoolMenuItem label="low" title="Senior Pool" price={100} aum={50} />
    </div>
  );
};

export interface PoolMenuItemProps {
  label: string;
  title: string;
  price: number;
  aum: number;
  selected?: boolean;
}

export const PoolMenuItem = (props: PoolMenuItemProps) => {
  const { label, title, price, aum, selected } = props;

  return (
    <button
      className={`flex items-center w-full px-5 py-3 panel ${
        selected ? '' : '!bg-inverted border !border-paper-lighter'
      }`}
      title={title}
    >
      <div className="text-left">
        <Tag label={`${label} risk`} className={`capitalize tag-risk-${label}`} />
        <h3 className="mt-2 mb-3 text-xl">{title}</h3>
        <div className="flex">
          <p>
            <span className="text-primary-light">Price </span>
            {price}
          </p>
          <p className="pl-2 ml-2 border-l">
            <span className="text-primary-light">AUM </span>
            {aum}
          </p>
        </div>
      </div>
      <div className="ml-auto">
        <ArrowTriangleIcon className="w-4 h-4 -rotate-90 text-primary" />
      </div>
    </button>
  );
};
