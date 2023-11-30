import { PopoverItemProps } from '..';

export const usePopoverItem = (props: PopoverItemProps) => {
  const { market, selectedMarket } = props;
  return {
    market,
    selectedMarket,
    onMarketClick: () => {},
    priceClass: 'text-price-higher',
    formattedPrice: '$1,000.00',
  };
};
