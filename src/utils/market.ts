import { isNil, isNotNil } from 'ramda';
import { Market } from '~/typings/market';

export const trimMarket = (market?: Market): Market | undefined => {
  if (isNil(market)) {
    return;
  }
  const { address, tokenAddress, description, image } = market;
  return { address, tokenAddress, description, image };
};
export const trimMarkets = (markets: Market[] = []): Market[] => {
  return markets.map(trimMarket).filter((market): market is Market => isNotNil(market));
};
