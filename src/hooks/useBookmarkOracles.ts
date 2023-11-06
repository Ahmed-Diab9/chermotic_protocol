import { isNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { Bookmark } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { trimMarkets } from '~/utils/market';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useEntireMarkets } from './useMarket';

export const useBookmarkOracles = () => {
  const { state: bookmarks } = useLocalStorage('app:bookmarks', [] as Bookmark[]);
  const { markets } = useEntireMarkets();
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    key: 'getBookmarkOracles',
    bookmarks: bookmarks && bookmarks?.length > 0 ? bookmarks : 'NO_BOOKMARKS',
    marketAddresses: trimMarkets(markets).reduce((addresses, market) => {
      addresses[market.description] = market.address;
      return addresses;
    }, {} as Record<string, Address>),
  };
  const {
    data: bookmarkOracles,
    isLoading: isBookmarkLoading,
    error,
    mutate: refetchBookmarks,
  } = useSWR(
    isReady && checkAllProps(fetchKey) && fetchKey,
    async ({ bookmarks, marketAddresses }) => {
      if (typeof bookmarks === 'string') {
        return [];
      }

      return PromiseOnlySuccess(
        bookmarks.map(async (bookmark) => {
          if (isNil(bookmark.id)) {
            throw new Error('Bookmark invalid');
          }
          const oracleProvider = await client
            .market()
            .contracts()
            .oracleProvider(marketAddresses[bookmark.marketDescription]);
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
    }
  );

  useError({ error });

  return { bookmarkOracles, isBookmarkLoading, refetchBookmarks };
};
