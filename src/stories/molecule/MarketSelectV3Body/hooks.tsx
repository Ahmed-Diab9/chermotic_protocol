import { useSettlementToken } from '~/hooks/useSettlementToken';

import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { formatUnits } from 'viem';
import { Address } from 'wagmi';
import useMarketOracles from '~/hooks/commons/useMarketOracles';
import useMarkets from '~/hooks/commons/useMarkets';
import { useLiquidityPools } from '~/hooks/useLiquidityPool';
import useLocalStorage from '~/hooks/useLocalStorage';
import { usePreviousOracles } from '~/hooks/usePreviousOracles';
import { Bookmark } from '~/typings/market';
import { formatDecimals } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export function useMarketSelectV3Body() {
  const liquidityFormatter = Intl.NumberFormat('en', {
    useGrouping: false,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  const { tokens, currentToken, isTokenLoading, onTokenSelect } = useSettlementToken();
  const { markets, currentMarket, isLoading: isMarketLoading, onMarketSelect } = useMarkets();
  const { marketOracles } = useMarketOracles({ markets });
  const { previousOracles } = usePreviousOracles({
    markets,
  });
  const { liquidityPools } = useLiquidityPools();
  const { state: bookmarks, setState: setBookmarks } = useLocalStorage(
    'app:bookmarks',
    [] as Bookmark[]
  );

  const priceFormatter = Intl.NumberFormat('en', {
    useGrouping: true,
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  });

  const isLoading = isTokenLoading || isMarketLoading;
  const isBookmarkeds = useMemo(() => {
    return bookmarks?.reduce((record, bookmark) => {
      record[bookmark.id] = true;
      return record;
    }, {} as Record<string, boolean>);
  }, [bookmarks]);

  const formattedTokens = (tokens ?? []).map((token) => {
    const key = token.address;
    const isSelectedToken = token.address === currentToken?.address;
    const name = token.name;
    const image = token.image;
    return { ...token, key, isSelectedToken, name, image };
  });

  const formattedMarkets = (isNotNil(tokens) && isNotNil(markets) ? markets : []).map((market) => {
    const key = market.address;
    const isSelectedMarket = market.address === currentMarket?.address;
    const token = tokens?.find((token) => token.address === market.tokenAddress);
    const price = priceFormatter.format(
      Number(formatDecimals(marketOracles?.[market.address]?.price, 18, 3))
    );
    const isBookmarked =
      isNotNil(token) && isNotNil(market)
        ? isBookmarkeds?.[`${token.name}:${market.description}`]
        : false;
    return {
      ...market,
      key,
      isSelectedMarket,
      token,
      price,
      isBookmarked,
    };
  });
  const priceClassMap = useMemo(() => {
    return Object.entries(previousOracles ?? {})?.reduce(
      (record, [marketAddress, previousOracle]) => {
        if (isNil(previousOracle)) {
          return record;
        }
        const priceClass = compareOracles(
          previousOracle,
          marketOracles?.[marketAddress as Address]
        );
        record[marketAddress as Address] = priceClass;
        return record;
      },
      {} as Record<Address, string>
    );
  }, [previousOracles, marketOracles]);

  const poolMap = useMemo(() => {
    if (isNil(currentToken)) {
      return;
    }
    return liquidityPools?.reduce((record, pool) => {
      const longLpSum = pool.bins
        .filter((bin) => bin.baseFeeRate > 0)
        .reduce((sum, bin) => sum + bin.liquidity, 0n);
      const shortLpSum = pool.bins
        .filter((bin) => bin.baseFeeRate < 0)
        .reduce((sum, bin) => sum + bin.liquidity, 0n);
      record[pool.marketAddress] = {
        longLpSum: liquidityFormatter.format(+formatUnits(longLpSum, currentToken.decimals)),
        shortLpSum: liquidityFormatter.format(+formatUnits(shortLpSum, currentToken.decimals)),
      };
      return record;
    }, {} as Record<Address, { longLpSum: string; shortLpSum: string } | undefined>);
  }, [liquidityPools, currentToken, liquidityFormatter]);

  const onTokenClick = useCallback(
    (tokenAddress: Address) => {
      const token = tokens?.find((token) => token.address === tokenAddress);
      if (isNil(token)) {
        return;
      }
      onTokenSelect(token);
    },
    [tokens, onTokenSelect]
  );

  const onMarketClick = useCallback(
    (marketAddress: Address) => {
      const market = markets?.find((market) => market.address === marketAddress);
      if (isNil(market)) {
        return;
      }
      onMarketSelect(market);
    },
    [markets, onMarketSelect]
  );

  const onBookmarkClick = (newBookmark: Bookmark) => {
    const foundBookmark = bookmarks?.find((bookmark) => bookmark.id === newBookmark.id);
    if (isNotNil(foundBookmark)) {
      setBookmarks((bookmarks ?? []).filter((bookmark) => bookmark.id !== newBookmark.id));
      return;
    }
    setBookmarks((bookmarks ?? []).concat(newBookmark));
  };

  return {
    isLoading,
    tokens: formattedTokens,
    markets: formattedMarkets,
    priceClassMap,
    poolMap,
    onTokenClick,
    onMarketClick,
    onBookmarkClick,
  };
}
