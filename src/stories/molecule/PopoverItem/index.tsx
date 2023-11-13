import { Avatar } from '~/stories/atom/Avatar';
import { Market } from '~/typings/market';
import { usePopoverItem } from './hooks';

export interface PopoverItemProps {
  market: Market;
  selectedMarket?: Market;
  onMarketClick?: (market: Market) => unknown;
}

export const PopoverItem = (props: PopoverItemProps) => {
  const { market, selectedMarket, onMarketClick, priceClass, formattedPrice } =
    usePopoverItem(props);
  return (
    <button
      key={market.address}
      className={`flex items-center justify-between gap-4 px-4 py-2 ${
        market.address === selectedMarket?.address && 'text-inverted bg-primary rounded-lg' // the market selected
      }`}
      onClick={() => onMarketClick?.(market)}
    >
      <Avatar label={market.description} src={market.image} fontSize="lg" gap="2" size="base" />
      <p className={`${priceClass}`}>{formattedPrice}</p>
    </button>
  );
};
