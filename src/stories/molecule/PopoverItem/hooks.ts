import { usePreviousOracle } from '~/hooks/usePreviousVersion';
import { formatDecimals } from '~/utils/number';
import { compareOracles } from '~/utils/price';
import { PopoverItemProps } from '.';

export const usePopoverItem = (props: PopoverItemProps) => {
  const { market, selectedMarket, onMarketClick } = props;
  const { previousOracle } = usePreviousOracle({ market });
  const priceFormatter = Intl.NumberFormat('en', {
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const priceClass = compareOracles(previousOracle, market.oracleValue);
  const formattedPrice =
    '$' + priceFormatter.format(Number(formatDecimals(market.oracleValue.price, 18, 2)));

  return {
    market,
    selectedMarket,
    onMarketClick,
    priceClass,
    formattedPrice,
  };
};
