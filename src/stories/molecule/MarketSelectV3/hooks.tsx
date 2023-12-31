import { useFeeRate } from '~/hooks/useFeeRate';
import { useOracleBefore24Hours } from '~/hooks/useOracleBefore24Hours';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';

import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { Address, usePublicClient } from 'wagmi';
import useMarketOracle from '~/hooks/commons/useMarketOracle';
import useMarkets from '~/hooks/commons/useMarkets';
import { useLastOracle } from '~/hooks/useLastOracle';
import { useLiquidityPools } from '~/hooks/useLiquidityPool';
import useLocalStorage from '~/hooks/useLocalStorage';
import { usePythPrice } from '~/hooks/usePythPrice';
import { Bookmark } from '~/typings/market';
import { formatDecimals, numberFormat } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export function useMarketSelectV3() {
  const liquidityFormatter = Intl.NumberFormat('en', {
    useGrouping: false,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  const { currentToken, isTokenLoading } = useSettlementToken();
  const { currentMarket, isLoading: isMarketLoading } = useMarkets();
  const { currentOracle } = useMarketOracle({ market: currentMarket });
  const { previousOracle } = usePreviousOracle({
    market: currentMarket,
  });
  const { feeRate } = useFeeRate();
  const publicClient = usePublicClient();
  const { formattedElapsed } = useLastOracle({
    market: currentMarket,
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
  const pythInfo = usePythPrice(currentMarket?.description);
  const isPriceLoading = isLoading || pythInfo.isLoading;
  const price = numberFormat(pythInfo.price, { roundingMode: 'trunc', minDigits: 2, maxDigits: 2 });
  const priceClass = compareOracles(previousOracle?.oracleBefore1Day, currentOracle);

  const interestRate = formatDecimals(((feeRate ?? 0n) * 100n) / (365n * 24n), 4, 4);
  const changeRate = useMemo(() => {
    const sign = changeRateRaw > 0n ? '+' : '';
    return sign + formatDecimals(changeRateRaw * 100n, ORACLE_PROVIDER_DECIMALS, 4, true) + '%';
  }, [changeRateRaw]);
  const changeRateClass = compareOracles(beforeOracle, currentOracle);

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
    isPriceLoading,
    token,
    market,
    isBookmarkeds,
    price,
    priceClass,
    poolMap,
    interestRate,
    changeRate,
    changeRateClass,
    explorerUrl,
    formattedElapsed,
    onBookmarkClick,
  };
}
