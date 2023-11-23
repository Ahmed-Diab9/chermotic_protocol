import { isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { MARKET_LOGOS } from '~/configs/token';
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
    bookmarks: bookmarks?.filter((bookmark) => isNotNil(bookmark.marketAddress)),
  };
  const {
    data: { bookmarkOracles, markets } = {},
    isLoading: isBookmarkLoading,
    error,
    mutate: refetchBookmarks,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ bookmarks }) => {
    const marketApi = client.market();

    const oracleProviders = await PromiseOnlySuccess(
      bookmarks.map(async (bookmark) => {
        return [
          bookmark.marketAddress,
          await marketApi.contracts().oracleProvider(bookmark.marketAddress),
        ] as const;
      })
    );
    const currentOracles = await PromiseOnlySuccess(
      oracleProviders.map(async (providerValue) => {
        const [marketAddress, oracleProvider] = providerValue;
        const currentOracle = await oracleProvider.read.currentVersion();
        return [marketAddress, currentOracle] as const;
      })
    );
    const reducedCurrentOracles = currentOracles.reduce((oracles, oracleValue) => {
      const [marketAddress, currentOracle] = oracleValue;
      oracles[marketAddress] = currentOracle;

      return oracles;
    }, {} as Record<Address, OracleVersion>);
    const previousOracles = await PromiseOnlySuccess(
      oracleProviders.map(async (oracleValue) => {
        const [marketAddress, oracleProvider] = oracleValue;
        const currentOracle = reducedCurrentOracles[marketAddress];
        if (isNil(currentOracle)) {
          return;
        }
        const previousOracle = await oracleProvider.read.atVersion([currentOracle.version - 1n]);
        return [marketAddress, previousOracle] as const;
      })
    );
    const reducedPreviousOracles = previousOracles.reduce((oracles, oracleValue) => {
      if (isNil(oracleValue)) {
        return oracles;
      }
      const [marketAddress, previousOracle] = oracleValue;
      oracles[marketAddress] = previousOracle;

      return oracles;
    }, {} as Record<Address, OracleVersion | undefined>);

    const markets = bookmarks.map(({ marketAddress, marketDescription, tokenAddress }) => {
      const [prefix] = marketDescription.split(/\s*\/\s*/) as [string, string];
      const image = MARKET_LOGOS[prefix];
      return {
        address: marketAddress,
        description: marketDescription,
        image,
        tokenAddress,
      };
    });

    const bookmarkOracles = bookmarks.map((bookmark) => ({
      ...bookmark,
      currentOracle: reducedCurrentOracles[bookmark.marketAddress],
      previousOracle: reducedPreviousOracles[bookmark.marketAddress],
    }));

    return { bookmarkOracles, markets };
  });

  useError({ error });

  return { bookmarkOracles, markets, isBookmarkLoading, refetchBookmarks };
};
