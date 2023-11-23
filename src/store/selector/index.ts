import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

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
