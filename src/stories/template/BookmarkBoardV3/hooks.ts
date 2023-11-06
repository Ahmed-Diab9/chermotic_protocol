import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';
import { useBookmarkOracles } from '~/hooks/useBookmarkOracles';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Bookmark } from '~/typings/market';
import { numberFormat } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export const useBookmarkBoardV3 = () => {
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
      prices[bookmark.id] = price;
      return prices;
    }, {} as Record<string, string>);
  }, [bookmarkOracles]);

  const bookmarkClasses = useMemo(() => {
    return bookmarkOracles?.reduce((classes, bookmark) => {
      const className = compareOracles(bookmark.previousOracle, bookmark.currentOracle);
      classes[bookmark.id] = className;
      return classes;
    }, {} as Record<string, string>);
  }, [bookmarkOracles]);

  const bookmarks = useMemo(() => {
    return bookmarkOracles?.map((oracle) => ({
      id: oracle.id,
      name: `${oracle.tokenName}-${oracle.marketDescription}`,
      tokenName: oracle.tokenName,
      marketDescription: oracle.marketDescription,
    }));
  }, [bookmarkOracles]);

  const onBookmarkClick = useCallback(
    async (bookmark: Bookmark) => {
      const token = tokens?.find((token) => token.name === bookmark.tokenName);
      if (isNil(token)) {
        toast.error('Token not selected.');
        return;
      }
      const market = markets?.find((market) => market.description === bookmark.marketDescription);
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
