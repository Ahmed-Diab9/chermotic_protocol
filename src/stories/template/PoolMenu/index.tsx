import { ArrowTriangleIcon } from '~/assets/icons/Icon';
import '~/stories/atom/Tabs/style.css';
import { Tag } from '~/stories/atom/Tag';
import { usePoolMenu } from './hooks';

export interface PoolMenuProps {}

export const PoolMenu = (props: PoolMenuProps) => {
  const { formattedLp, selectedLp, onMenuClick } = usePoolMenu();

  return (
    <div className="flex flex-col gap-3 PoolMenu">
      {formattedLp?.map((lp, lpIndex) => {
        return (
          <PoolMenuItem
            key={`${lp.name}-${lpIndex}`}
            title={lp.name}
            price={lp.price}
            aum={lp.assets}
            label={lp.label ?? 'No labels'}
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

export interface PoolMenuItemProps {
  label: string;
  title: string;
  price: number | string;
  aum: number | string;
  tokenSymbol: string;
  selected?: boolean;
  onClick?: () => void;
}

export const PoolMenuItem = (props: PoolMenuItemProps) => {
  const { label, title, price, aum, tokenSymbol, selected, onClick } = props;

  return (
    <button
      className={`flex items-center w-full px-5 py-3 panel ${
        selected ? '' : '!bg-inverted border !border-gray-lighter'
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
