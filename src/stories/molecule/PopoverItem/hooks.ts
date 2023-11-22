import useMarketOracle from '~/hooks/commons/useMarketOracle';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import { formatDecimals } from '~/utils/number';
import { compareOracles } from '~/utils/price';
import { PopoverItemProps } from '.';

export const usePopoverItem = (props: PopoverItemProps) => {
  const { market, selectedMarket, onMarketClick } = props;
  const { currentOracle } = useMarketOracle({ market });
  const { previousOracle } = usePreviousOracle({
    market: selectedMarket,
  });
  const priceFormatter = Intl.NumberFormat('en', {
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const priceClass = compareOracles(previousOracle?.oracleBefore1Day, currentOracle);
  const formattedPrice =
    '$' + priceFormatter.format(Number(formatDecimals(currentOracle?.price, 18, 2)));

  return {
    market,
    selectedMarket,
    onMarketClick,
    priceClass,
    formattedPrice,
  };
};
