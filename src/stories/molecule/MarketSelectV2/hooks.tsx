import { useFeeRate } from '~/hooks/useFeeRate';
import { useMarket } from '~/hooks/useMarket';
import { useOracleBefore24Hours } from '~/hooks/useOracleBefore24Hours';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';

import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { Address, usePublicClient } from 'wagmi';
import { useBookmarkOracles } from '~/hooks/useBookmarkOracles';
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
  const { refetchBookmarks } = useBookmarkOracles();
  const { tokens: _tokens, currentToken, isTokenLoading, onTokenSelect } = useSettlementToken();
  const { markets: _markets, currentMarket, isMarketLoading, onMarketSelect } = useMarket();
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
  const { previousOracles, isLoading: isOraclesLoading } = usePreviousOracles({
    markets: _markets,
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

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;
  const marketDescription = currentMarket?.description || '-';
  const marketAddress = currentMarket?.address;
  const marketImage = currentMarket?.image;

  const tokens = (_tokens ?? []).map((token) => {
    const key = token.address;
    const isSelectedToken = token.address === currentToken?.address;
    const onClickToken = () => {
      return onTokenSelect(token);
    };
    const name = token.name;
    const image = token.image;
    return { key, isSelectedToken, onClickToken, name, image };
  });

  const markets = (_markets ?? []).map((market) => {
    const key = market.address;
    const isSelectedMarket = market.address === currentMarket?.address;
    const onClickMarket = () => {
      return onMarketSelect(market);
    };
    const settlementToken = _tokens?.find((token) => token.address === market.tokenAddress)?.name;
    const description = market.description;
    const price = priceFormatter.format(Number(formatDecimals(market.oracleValue.price, 18, 2)));
    const image = market.image;
    return {
      key,
      isSelectedMarket,
      onClickMarket,
      description,
      price,
      settlementToken,
      image,
    };
  });

  const price = formatDecimals(
    currentMarket?.oracleValue?.price || 0,
    ORACLE_PROVIDER_DECIMALS,
    2,
    true
  );
  const priceClass = compareOracles(previousOracle?.oracleBefore1Day, currentMarket?.oracleValue);

  const interestRate = formatDecimals(((feeRate ?? 0n) * 100n) / (365n * 24n), 4, 4);
  const changeRate = useMemo(() => {
    const sign = changeRateRaw > 0n ? '+' : '';
    return sign + formatDecimals(changeRateRaw * 100n, ORACLE_PROVIDER_DECIMALS, 4, true) + '%';
  }, [changeRateRaw]);
  const changeRateClass = compareOracles(beforeOracle, currentMarket?.oracleValue);

  const priceClassMap = useMemo(() => {
    return previousOracles?.reduce((record, previousOracle) => {
      if (isNil(previousOracle)) {
        return record;
      }
      const currentMarket = _markets?.find(
        (_market) => _market.address === previousOracle?.marketAddress
      );
      const priceClass = compareOracles(previousOracle, currentMarket?.oracleValue);
      record[previousOracle.marketAddress] = priceClass;
      return record;
    }, {} as Record<Address, string>);
  }, [previousOracles, _markets]);

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
    }, {} as Record<Address, { longLpSum: string; shortLpSum: string }>);
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

  const onBookmarkClick = (newBookmark: Bookmark) => {
    const storedAddress = bookmarks?.find(
      (bookmark) => bookmark.marketAddress === newBookmark.marketAddress
    )?.marketAddress;
    if (isNotNil(storedAddress)) {
      setBookmarks(
        (bookmarks ?? []).filter((bookmark) => bookmark.marketAddress !== storedAddress)
      );
      return;
    }
    setBookmarks((bookmarks ?? []).concat(newBookmark));
  };

  const isBookmarked = useMemo(() => {
    return bookmarks?.reduce((record, bookmark) => {
      record[bookmark.marketAddress] = true;
      return record;
    }, {} as Record<Address, boolean>);
  }, [bookmarks]);

  return {
    isLoading,
    tokenName,
    tokenImage,
    marketDescription,
    marketAddress,
    marketImage,
    tokens,
    markets,
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
    onBookmarkClick,
  };
}
