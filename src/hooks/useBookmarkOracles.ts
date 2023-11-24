import { isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { MARKET_LOGOS } from '~/configs/token';
import { Bookmark } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { checkAllProps } from '~/utils';
import { promiseIfFulfilled } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useBookmarkOracles = () => {
  const { state: bookmarks } = useLocalStorage('app:bookmarks', [] as Bookmark[]);
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    key: 'getBookmarkOracles',
    bookmarks:
      isNotNil(bookmarks) && bookmarks.length > 0
        ? bookmarks.filter((bookmark) => isNotNil(bookmark.marketAddress))
        : ('EMPTY' as const),
  };
  const {
    data: bookmarkOracles,
    isLoading: isBookmarkLoading,
    error,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ bookmarks }) => {
    if (bookmarks === 'EMPTY') {
      return [];
    }
    const marketApi = client.market();

    const oracleProviders = await promiseIfFulfilled(
      bookmarks.map(async (bookmark) => {
        return marketApi.contracts().oracleProvider(bookmark.marketAddress);
      })
    );
    const currentOracles = await promiseIfFulfilled(
      oracleProviders.map(async (provider) => {
        if (isNil(provider)) {
          return;
        }
        const currentOracle = await provider.read.currentVersion();
        return currentOracle;
      })
    );
    const reducedCurrentOracles = bookmarks.reduce((oracles, bookmark, index) => {
      const { marketAddress } = bookmark;
      const currentOracle = currentOracles[index];
      oracles[marketAddress] = currentOracle;

      return oracles;
    }, {} as Record<Address, OracleVersion | undefined>);
    const previousOracles = await promiseIfFulfilled(
      oracleProviders.map(async (provider, index) => {
        const currentOracle = currentOracles[index];
        if (isNil(provider) || isNil(currentOracle) || currentOracle.version < 1n) {
          return;
        }
        const previousOracle = await provider.read.atVersion([currentOracle.version - 1n]);
        return previousOracle;
      })
    );
    const reducedPreviousOracles = bookmarks.reduce((oracles, bookmark, index) => {
      const { marketAddress } = bookmark;
      const previousOracle = previousOracles[index];
      oracles[marketAddress] = previousOracle;

      return oracles;
    }, {} as Record<Address, OracleVersion | undefined>);

    const bookmarkOracles = bookmarks.map((bookmark) => ({
      ...bookmark,
      currentOracle: reducedCurrentOracles[bookmark.marketAddress],
      previousOracle: reducedPreviousOracles[bookmark.marketAddress],
    }));

    return bookmarkOracles;
  });

  const markets = bookmarkOracles?.map(({ marketAddress, marketDescription, tokenAddress }) => {
    const [prefix] = marketDescription.split(/\s*\/\s*/) as [string, string];
    const image = MARKET_LOGOS[prefix];
    return {
      address: marketAddress,
      description: marketDescription,
      image,
      tokenAddress,
    };
  });

  useError({ error });

  return { bookmarkOracles, markets, isBookmarkLoading };
};
