import { useFeeRate } from '~/hooks/useFeeRate';
import { useOracleBefore24Hours } from '~/hooks/useOracleBefore24Hours';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';

import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { formatUnits } from 'viem';
import { Address, usePublicClient } from 'wagmi';
import useMarketOracle from '~/hooks/commons/useMarketOracle';
import useMarketOracles from '~/hooks/commons/useMarketOracles';
import useMarkets from '~/hooks/commons/useMarkets';
import { useLastOracle } from '~/hooks/useLastOracle';
import { useLiquidityPools } from '~/hooks/useLiquidityPool';
import useLocalStorage from '~/hooks/useLocalStorage';
import { usePreviousOracles } from '~/hooks/usePreviousOracles';
import { Bookmark } from '~/typings/market';
import { formatDecimals } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export function useMarketSelectV2() {
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
  const { currentOracle } = useMarketOracle({ market: currentMarket });
  const { previousOracles, isLoading: isOraclesLoading } = usePreviousOracles({
    markets,
  });
  const { previousOracle } = usePreviousOracle({
    market: currentMarket,
  });
  const { feeRate } = useFeeRate();
  const publicClient = usePublicClient();
  const { formattedElapsed } = useLastOracle({
    format: ({ type, value }) => {
      switch (type) {
        case 'hour': {
          return `${value}`;
        }
        case 'minute': {
          return `${value}`;
        }
        case 'second': {
          return `${value}`;
        }
        case 'literal': {
          return ':';
        }
        case 'dayPeriod': {
          return '';
        }
        default:
          return value;
      }
    },
  });
  const {
    changeRate: changeRateRaw = 0n,
    isLoading: isOracleLoading,
    oracle: beforeOracle,
  } = useOracleBefore24Hours({
    market: currentMarket,
  });
  const { liquidityPools } = useLiquidityPools();
  const { state: bookmarks, setState: setBookmarks } = useLocalStorage(
    'app:bookmarks',
    [] as Bookmark[]
  );

  const priceFormatter = Intl.NumberFormat('en', {
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const isLoading = isTokenLoading || isMarketLoading;

  const token = useMemo(() => {
    if (isNil(currentToken)) {
      return;
    }
    const { name, address, image } = currentToken;
    return { name, address, image };
  }, [currentToken]);
  const market = useMemo(() => {
    if (isNil(currentMarket)) {
      return;
    }
    const { description, address, image } = currentMarket;
    return { address, description, image };
  }, [currentMarket]);

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

  const price = formatDecimals(currentOracle?.price || 0, ORACLE_PROVIDER_DECIMALS, 2, true);
  const priceClass = compareOracles(previousOracle?.oracleBefore1Day, currentOracle);

  const interestRate = formatDecimals(((feeRate ?? 0n) * 100n) / (365n * 24n), 4, 4);
  const changeRate = useMemo(() => {
    const sign = changeRateRaw > 0n ? '+' : '';
    return sign + formatDecimals(changeRateRaw * 100n, ORACLE_PROVIDER_DECIMALS, 4, true) + '%';
  }, [changeRateRaw]);
  const changeRateClass = compareOracles(beforeOracle, currentOracle);

  const priceClassMap = useMemo(() => {
    return Object.entries(previousOracles ?? {})?.reduce(
      (record, [marketAddress, previousOracle]) => {
        if (isNil(previousOracle)) {
          return record;
        }
        const priceClass = compareOracles(previousOracle, currentOracle);
        record[marketAddress as Address] = priceClass;
        return record;
      },
      {} as Record<Address, string>
    );
  }, [previousOracles, currentOracle]);

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

  const explorerUrl = useMemo(() => {
    try {
      const rawUrl = publicClient.chain.blockExplorers?.default?.url;
      if (isNil(rawUrl)) return;
      const origin = new URL(rawUrl).origin;
      if (isNil(origin) || isNil(currentMarket)) return;
      return `${origin}/address/${currentMarket.address}`;
    } catch (error) {
      return;
    }
  }, [publicClient, currentMarket]);

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
      setBookmarks((bookmarks ?? []).filter((bookmark) => bookmark.id !== foundBookmark.id));
      return;
    }
    setBookmarks((bookmarks ?? []).concat(newBookmark));
  };

  const isBookmarked = useMemo(() => {
    return bookmarks?.reduce((record, bookmark) => {
      record[bookmark.id] = true;
      return record;
    }, {} as Record<string, boolean>);
  }, [bookmarks]);

  return {
    isLoading,
    token,
    market,
    tokens: formattedTokens,
    markets: formattedMarkets,
    isBookmarkeds,
    price,
    priceClass,
    priceClassMap,
    poolMap,
    interestRate,
    changeRate,
    changeRateClass,
    explorerUrl,
    isBookmarked,
    formattedElapsed,
    onTokenClick,
    onMarketClick,
    onBookmarkClick,
  };
}
