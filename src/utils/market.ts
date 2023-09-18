import { isNil, isNotNil } from 'ramda';
import { Market, MarketLike } from '~/typings/market';

export const trimMarket = (market?: Market): MarketLike | undefined => {
  if (isNil(market)) {
    return;
  }
  const { address, tokenAddress, description } = market;
  return { address, tokenAddress, description };
};
export const trimMarkets = (markets: Market[] = []): MarketLike[] => {
  return markets.map(trimMarket).filter((market): market is MarketLike => isNotNil(market));
};
