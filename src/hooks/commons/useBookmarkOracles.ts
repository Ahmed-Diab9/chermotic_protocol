import { isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { MARKET_LOGOS } from '~/configs/token';
import { Bookmark, Market } from '~/typings/market';
import { checkAllProps } from '~/utils';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';
import useLocalStorage from '../useLocalStorage';
import { usePreviousOracles } from '../usePreviousOracles';
import useMarketOracles from './useMarketOracles';

const useBookmarkOracles = () => {
  const { state: bookmarks } = useLocalStorage('app:bookmarks', [] as Bookmark[]);
  const { isReady } = useChromaticClient();
  const fetchKey = {
    key: 'useBookmarkOracles',
    bookmarks:
      isNotNil(bookmarks) && bookmarks.length > 0
        ? bookmarks.filter((bookmark) => isNotNil(bookmark.marketAddress))
        : ('EMPTY' as const),
  };

  const { data: markets, error } = useSWR(
    isReady && checkAllProps(fetchKey) && fetchKey,
    async ({ bookmarks }) => {
      if (bookmarks === 'EMPTY') {
        return [];
      }
      return bookmarks.map((bookmark) => {
        const { marketDescription, marketAddress, tokenAddress } = bookmark;
        const [prefix] = marketDescription.split(/\s*\/\s*/) as [string, string];
        const image = MARKET_LOGOS[prefix];
        return {
          address: marketAddress,
          description: marketDescription,
          image,
          tokenAddress,
        } satisfies Market;
      });
    }
  );

  const { marketOracles, mutateMarketOracles } = useMarketOracles({ markets });
  const { previousOracles } = usePreviousOracles({ markets });
  const bookmarkOracles = useMemo(() => {
    return bookmarks?.map((bookmark, index) => {
      return {
        ...bookmark,
        currentOracle: marketOracles?.[bookmark.marketAddress],
        previousOracle: previousOracles?.[bookmark.marketAddress],
      };
    });
  }, [bookmarks, marketOracles, previousOracles]);

  useError({ error });

  return { bookmarkOracles, markets, mutateMarketOracles };
};

export default useBookmarkOracles;
