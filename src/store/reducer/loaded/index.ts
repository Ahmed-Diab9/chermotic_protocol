import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface LoadedState {
  isPositionsLoaded: boolean;
  isChromaticLpsLoaded: boolean;
  isPriceFeedLoaded: boolean;
  isLpReceiptsLoaded: boolean;
}

const initialState: LoadedState = {
  isPositionsLoaded: false,
  isChromaticLpsLoaded: false,
  isPriceFeedLoaded: false,
  isLpReceiptsLoaded: false,
};

const loadedSlice = createSlice({
  name: 'loadeds',
  initialState,
  reducers: {
    onDataLoaded: (
      state,
      action: PayloadAction<'positions' | 'chromaticLp' | 'priceFeed' | 'lpReceipts'>
    ) => {
      switch (action.payload) {
        case 'positions': {
          state.isPositionsLoaded = true;
          break;
        }
        case 'chromaticLp': {
          state.isChromaticLpsLoaded = true;
          break;
        }
        case 'priceFeed': {
          state.isPriceFeedLoaded = true;
          break;
        }
        case 'lpReceipts': {
          state.isLpReceiptsLoaded = true;
          break;
        }
      }
      return state;
    },
  },
});

export const loadedAction = loadedSlice.actions;
export const loadedReducer = loadedSlice.reducer;
