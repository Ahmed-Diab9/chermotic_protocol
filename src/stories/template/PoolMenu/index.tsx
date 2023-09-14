import { useState } from 'react';
import { Progress } from '~/stories/atom/Progress';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import { Tag } from '~/stories/atom/Tag';
import '~/stories/atom/Tabs/style.css';

export interface PoolMenuProps {}

export const PoolMenu = (props: PoolMenuProps) => {
  const [selected, setSelected] = useState<string | null>('high');

  const handleItemClick = (label: string) => {
    setSelected(label);
  };

  return (
    <div className="flex flex-col gap-3 PoolMenu">
      <PoolMenuItem
        label="high"
        title="Junior Pool"
        price={100}
        aum={50}
        selected={selected === 'high'}
        onClick={() => handleItemClick('high')}
      />
      <PoolMenuItem
        label="mid"
        title="Mezzanine Pool"
        price={100}
        aum={50}
        selected={selected === 'mid'}
        onClick={() => handleItemClick('mid')}
      />
      <PoolMenuItem
        label="low"
        title="Senior Pool"
        price={100}
        aum={50}
        selected={selected === 'low'}
        onClick={() => handleItemClick('low')}
      />
    </div>
  );
};

export interface PoolMenuItemProps {
  label: string;
  title: string;
  price: number;
  aum: number;
  selected?: boolean;
  onClick?: () => void;
}

export const PoolMenuItem = (props: PoolMenuItemProps) => {
  const { label, title, price, aum, selected, onClick } = props;

  return (
    <button
      className={`flex items-center w-full px-5 py-3 panel ${
        selected ? '' : '!bg-inverted border !border-paper-lighter'
      }`}
      title={title}
      onClick={onClick}
    >
      <div className="text-left">
        <Tag label={`${label} risk`} className={`tag-risk-${label}`} />
        <h3 className="mt-2 mb-3 text-xl">{title}</h3>
        <div className="flex text-primary-light">
          <p>
            Price
            <span className="ml-1 mr-0">{price}</span>
            ETH
          </p>
          <p className="pl-2 ml-2 border-l !border-primary-lighter">
            AUM
            <span className="ml-1 mr-0">{aum}</span>
            ETH
          </p>
        </div>
      </div>
      <div className="ml-auto">
        <ArrowTriangleIcon className="w-4 h-4 -rotate-90 text-primary" />
      </div>
    </button>
  );
};
