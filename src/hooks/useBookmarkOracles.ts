import useSWR from 'swr';
import { Bookmark } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useBookmarkOracles = () => {
  const { state: bookmarks } = useLocalStorage('app:bookmarks', [] as Bookmark[]);
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    key: 'getBookmarkOracles',
    bookmarks: bookmarks && bookmarks?.length > 0 ? bookmarks : 'NO_BOOKMARKS',
  };
  const {
    data: bookmarkOracles,
    isLoading: isBookmarkLoading,
    error,
    mutate: refetchBookmarks,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ bookmarks }) => {
    if (typeof bookmarks === 'string') {
      return [];
    }
    return PromiseOnlySuccess(
      bookmarks.map(async (bookmark) => {
        const oracleProvider = await client
          .market()
          .contracts()
          .oracleProvider(bookmark.marketAddress);
        const currentOracle: OracleVersion = await oracleProvider.read.currentVersion();
        if (currentOracle.version <= 0) {
          return {
            ...bookmark,
            currentOracle,
            previousOracle: undefined,
          };
        }
        const previousOracle: OracleVersion = await oracleProvider.read.atVersion([
          currentOracle.version - 1n,
        ]);
        return {
          ...bookmark,
          currentOracle,
          previousOracle,
        };
      })
    );
  });

  useError({ error });

  return { bookmarkOracles, isBookmarkLoading, refetchBookmarks };
};
