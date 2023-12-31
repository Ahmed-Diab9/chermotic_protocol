import { useFeeRate } from '~/hooks/useFeeRate';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';

import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { Address, usePublicClient } from 'wagmi';
import useMarketOracle from '~/hooks/commons/useMarketOracle';
import useMarketOracles from '~/hooks/commons/useMarketOracles';
import useMarkets from '~/hooks/commons/useMarkets';
import { formatDecimals } from '~/utils/number';
import { compareOracles } from '~/utils/price';

export function useMarketSelect() {
  const { tokens, currentToken, isTokenLoading, onTokenSelect } = useSettlementToken();
  const { markets, currentMarket, isLoading: isMarketLoading, onMarketSelect } = useMarkets();
  const { marketOracles } = useMarketOracles({ markets });
  const { currentOracle } = useMarketOracle({ market: currentMarket });
  const { previousOracle } = usePreviousOracle({
    market: currentMarket,
  });
  const { feeRate } = useFeeRate();
  const publicClient = usePublicClient();

  const priceFormatter = Intl.NumberFormat('en', {
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const isLoading = isTokenLoading || isMarketLoading;

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;
  const marketDescription = currentMarket?.description || '-';
  const marketImage = currentMarket?.image;

  const formattedTokens = (tokens ?? []).map((token) => {
    const key = token.address;
    const isSelectedToken = token.address === currentToken?.address;
    const name = token.name;
    const image = token.image;
    return { ...token, key, isSelectedToken, name, image };
  });

  const formattedMarkets = (markets ?? []).map((market) => {
    const key = market.address;
    const isSelectedMarket = market.address === currentMarket?.address;
    const description = market.description;
    const price = priceFormatter.format(
      Number(formatDecimals(marketOracles?.[market.address]?.price, 18, 3))
    );
    const image = market.image;
    return { ...market, key, isSelectedMarket, description, price, image };
  });

  const price = formatDecimals(currentOracle?.price || 0, ORACLE_PROVIDER_DECIMALS, 2, true);
  const priceClass = compareOracles(previousOracle?.oracleBefore1Day, currentOracle);

  const interestRate = formatDecimals(((feeRate ?? 0n) * 100n) / (365n * 24n), 4, 4);

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

  return {
    isLoading,
    tokenName,
    tokenImage,
    marketDescription,
    marketImage,
    tokens: formattedTokens,
    markets: formattedMarkets,
    price,
    priceClass,
    interestRate,
    explorerUrl,
    onTokenClick,
    onMarketClick,
  };
}
