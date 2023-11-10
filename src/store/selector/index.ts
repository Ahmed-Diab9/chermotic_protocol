import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export const isLpReadySelector = createSelector(
  (state: RootState) => state.loaded,
  (loaded) => {
    const { isChromaticLpsLoaded, isLpReceiptsLoaded } = loaded;
    return isChromaticLpsLoaded && isLpReceiptsLoaded;
  }
);

export const isPositionsReadySelector = createSelector(
  (state: RootState) => state.loaded,
  (loaded) => {
    const { isPositionsLoaded } = loaded;
    return isPositionsLoaded;
  }
);

export const selectedLpSelector = createSelector(
  (state: RootState) => state.lp,
  (lp) => lp.selectedLp
);

export const selectedTokenSelector = createSelector(
  (state: RootState) => state.token,
  (token) => token.selectedToken
);

export const selectedMarketSelector = createSelector(
  (state: RootState) => state.market,
  (market) => market.selectedMarket
);
