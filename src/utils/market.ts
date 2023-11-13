import { isNil, isNotNil } from 'ramda';
import { Address } from 'wagmi';
import { Market, MarketLike } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';

export const trimMarket = (market?: Market): MarketLike | undefined => {
  if (isNil(market)) {
    return;
  }
  const { address, tokenAddress, description, image } = market;
  return { address, tokenAddress, description, image };
};
export const trimMarkets = (markets: Market[] = []): MarketLike[] => {
  return markets.map(trimMarket).filter((market): market is MarketLike => isNotNil(market));
};

export const compareMarkets = (previousMarkets: Market[], currentMarkets: Market[]) => {
  const reducedPrevious = previousMarkets.reduce((reduced, market) => {
    reduced[market.address] = market.oracleValue;
    return reduced;
  }, {} as Record<Address, OracleVersion>);
  const reducedCurrent = currentMarkets.reduce((reduced, market) => {
    reduced[market.address] = market.oracleValue;
    return reduced;
  }, {} as Record<Address, OracleVersion>);

  for (let index = 0; index < currentMarkets.length; index++) {
    const marketAddress = currentMarkets[index].address;
    if (isNil(marketAddress)) {
      continue;
    }

    const previousVersion = reducedPrevious[marketAddress];
    const currentVersion = reducedCurrent[marketAddress];

    if (previousVersion.version < currentVersion.version) {
      return true;
    }
  }
  return false;
};
