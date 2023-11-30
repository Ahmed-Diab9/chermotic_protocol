import { isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { MARKET_LOGOS } from '~/configs/token';
import { Bookmark, Market } from '~/typings/market';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';
import useLocalStorage from '../useLocalStorage';
import { usePreviousOracles } from '../usePreviousOracles';
import useMarketOracles from './useMarketOracles';

const useBookmarkOracles = () => {
  const { state: bookmarks } = useLocalStorage('app:bookmarks', [] as Bookmark[]);
  const { isReady } = useChromaticClient();

  const filteredBookmarks = useMemo(() => {
    const filtered = bookmarks?.filter((bookmark) => isNotNil(bookmark.marketAddress));

    return filtered ?? [];
  }, [bookmarks]);

  const fetchKey = {
    key: 'useBookmarkOracles',
    bookmarks: filteredBookmarks,
  };

  const { data: markets, error } = useSWR(isReady && fetchKey, async ({ bookmarks }) => {
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
  });

  const { marketOracles, mutateMarketOracles } = useMarketOracles({ markets });
  const { previousOracles } = usePreviousOracles({ markets });
  const bookmarkOracles = useMemo(() => {
    return filteredBookmarks?.map((bookmark, index) => {
      return {
        ...bookmark,
        currentOracle: marketOracles?.[bookmark.marketAddress],
        previousOracle: previousOracles?.[bookmark.marketAddress],
      };
    });
  }, [filteredBookmarks, marketOracles, previousOracles]);

  useError({ error });

  return { bookmarkOracles, markets, mutateMarketOracles };
};

export default useBookmarkOracles;
