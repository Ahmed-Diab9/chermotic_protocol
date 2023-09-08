import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem';
import { Address } from 'wagmi';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useBookmarkOracles } from '~/hooks/useBookmarkOracles';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Bookmark } from '~/typings/market';
import { numberFormat } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export const useBookmarkBoard = () => {
  const { bookmarkOracles, isBookmarkLoading } = useBookmarkOracles();
  const { tokens, onTokenSelect } = useSettlementToken();
  const { markets } = useEntireMarkets();
  const { onMarketSelect } = useMarket();

  const bookmarkPrices = useMemo(() => {
    return bookmarkOracles?.reduce((prices, bookmark) => {
      const price = numberFormat(
        formatUnits(bookmark.currentOracle.price, ORACLE_PROVIDER_DECIMALS),
        {
          maxDigits: 2,
          minDigits: 2,
          roundingMode: 'trunc',
          type: 'string',
        }
      );
      prices[bookmark.marketAddress] = price;
      return prices;
    }, {} as Record<Address, string>);
  }, [bookmarkOracles]);

  const bookmarkClasses = useMemo(() => {
    return bookmarkOracles?.reduce((classes, bookmark) => {
      const className = compareOracles(bookmark.previousOracle, bookmark.currentOracle);
      classes[bookmark.marketAddress] = className;
      return classes;
    }, {} as Record<Address, string>);
  }, [bookmarkOracles]);

  const bookmarks = useMemo(() => {
    return bookmarkOracles?.map((oracle) => ({
      name: `${oracle.tokenName}-${oracle.marketDescription}`,
      tokenName: oracle.tokenName,
      marketDescription: oracle.marketDescription,
      marketAddress: oracle.marketAddress,
    }));
  }, [bookmarkOracles]);

  const onBookmarkClick = useCallback(
    async (bookmark: Bookmark) => {
      const token = tokens?.find((token) => token.name === bookmark.tokenName);
      if (isNil(token)) {
        toast.error('Token not selected.');
        return;
      }
      const market = markets?.find((market) => market.address === bookmark.marketAddress);
      if (isNil(market)) {
        toast.error('Market not selected.');
        return;
      }
      onTokenSelect(token);
      onMarketSelect(market);
    },
    [tokens, markets]
  );

  return {
    bookmarks,
    bookmarkPrices,
    bookmarkClasses,
    isBookmarkLoading,
    onBookmarkClick,
  };
};
