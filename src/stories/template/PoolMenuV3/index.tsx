import { useMemo } from 'react';
import { ArrowTriangleIcon } from '~/assets/icons/Icon';
import '~/stories/atom/Tabs/style.css';
import { Tag } from '~/stories/atom/Tag';
import { usePoolMenuV3 } from './hooks';

export interface PoolMenuV3Props {}

export const PoolMenuV3 = (props: PoolMenuV3Props) => {
  const { formattedLp, selectedLp, onMenuClick } = usePoolMenuV3();

  return (
    <div className="flex flex-col gap-3 PoolMenuV3">
      {formattedLp?.map((lp, lpIndex) => {
        return (
          <PoolMenuV3Item
            key={`${lp.name}-${lpIndex}`}
            name={lp.name}
            tag={lp.tag}
            price={lp.price}
            aum={lp.assets}
            tokenSymbol={lp.tokenSymbol}
            selected={lp.name === selectedLp?.name}
            onClick={() => {
              onMenuClick(lp.name);
            }}
          />
        );
      })}
    </div>
  );
};

export interface PoolMenuV3ItemProps {
  name: string;
  tag: string;
  price: number | string;
  aum: number | string;
  tokenSymbol: string;
  selected?: boolean;
  onClick?: () => void;
}

export const PoolMenuV3Item = (props: PoolMenuV3ItemProps) => {
  const { name, tag, price, aum, tokenSymbol, selected, onClick } = props;
  const tagClass = useMemo(() => {
    switch (tag.toLowerCase()) {
      case 'high risk': {
        return 'tag-risk-high';
      }
      case 'mid risk': {
        return 'tag-risk-mid';
      }
      case 'low risk': {
        return 'tag-risk-low';
      }
    }
    return '';
  }, [tag]);

  return (
    <button
      className={`flex items-center w-full px-5 py-3 border rounded ${
        selected ? 'border-primary-light bg-primary/10' : 'border-primary/10'
      }`}
      title={name}
      onClick={onClick}
    >
      <div className="text-left">
        <Tag label={`${tag}`} className={tagClass} />
        <h3 className="mt-2 mb-3 text-xl">{name}</h3>
        <div className="flex text-primary-light">
          <p>
            Price
            <span className="ml-1 mr-0">{price}</span>
            {/* unit: settlement token */}
            {' ' + tokenSymbol}
          </p>
          <p className="pl-2 ml-2 border-l !border-primary-lighter">
            AUM
            <span className="ml-1 mr-0">{aum}</span>
            {/* unit: settlement token */}
            {' ' + tokenSymbol}
          </p>
        </div>
      </div>
      <div className="ml-auto">
        <ArrowTriangleIcon className="w-4 h-4 -rotate-90 text-primary" />
      </div>
    </button>
  );
};
