import { useState } from 'react';
import { Progress } from '~/stories/atom/Progress';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import { Tag } from '~/stories/atom/Tag';
import '~/stories/atom/Tabs/style.css';

export interface PoolMenuV3Props {}

export const PoolMenuV3 = (props: PoolMenuV3Props) => {
  const [selected, setSelected] = useState<string | null>('high');

  const handleItemClick = (label: string) => {
    setSelected(label);
  };

  return (
    <div className="flex flex-col gap-3 PoolMenuV3">
      <PoolMenuV3Item
        label="high"
        title="Junior Pool"
        price={100}
        aum={50}
        selected={selected === 'high'}
        onClick={() => handleItemClick('high')}
      />
      <PoolMenuV3Item
        label="mid"
        title="Mezzanine Pool"
        price={100}
        aum={50}
        selected={selected === 'mid'}
        onClick={() => handleItemClick('mid')}
      />
      <PoolMenuV3Item
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

export interface PoolMenuV3ItemProps {
  label: string;
  title: string;
  price: number;
  aum: number;
  selected?: boolean;
  onClick?: () => void;
}

export const PoolMenuV3Item = (props: PoolMenuV3ItemProps) => {
  const { label, title, price, aum, selected, onClick } = props;

  return (
    <button
      className={`flex items-center w-full px-5 py-3 border rounded ${
        selected ? 'border-primary-light' : 'border-primary/10'
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
            {/* unit: settlement token */}
            ETH
          </p>
          <p className="pl-2 ml-2 border-l !border-primary-lighter">
            AUM
            <span className="ml-1 mr-0">{aum}</span>
            {/* unit: settlement token */}
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
