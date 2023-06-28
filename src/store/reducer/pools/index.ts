import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Bin, LiquidityPool, OwnedBin } from '../../../typings/pools';

interface PoolState {
  selectedPool?: LiquidityPool;
  selectedBins: OwnedBin[];
  isModalOpen: boolean;
}

const initialState: PoolState = {
  selectedPool: undefined,
  selectedBins: [],
  isModalOpen: false,
};

const poolsSlice = createSlice({
  name: 'pools',
  initialState,
  reducers: {
    onPoolSelect: (state, action: PayloadAction<LiquidityPool>) => {
      state.selectedPool = action.payload;
    },
    onBinSelect: (state, action: PayloadAction<OwnedBin>) => {
      state.selectedBins = [action.payload];
      state.isModalOpen = true;
    },
    onBinsSelect: (state, action: PayloadAction<OwnedBin>) => {
      state.selectedBins = state.selectedBins.concat(action.payload);
    },
    onBinsUnselect: (state, action: PayloadAction<OwnedBin>) => {
      const filtered = state.selectedBins.filter(
        (bin) => bin.baseFeeRate !== action.payload.baseFeeRate
      );
      state.selectedBins = filtered;
    },
    onBinsReset: (state) => {
      state.selectedBins = [];
      state.isModalOpen = false;
    },
    onModalOpen: (state) => {
      state.isModalOpen = true;
    },
    onModalClose: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
