import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Bin, LiquidityPool } from "../../../typings/pools";

interface PoolState {
  selectedPool?: LiquidityPool;
  selectedBins: Bin[];
}

const initialState: PoolState = {
  selectedPool: undefined,
  selectedBins: [],
};

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    onPoolSelect: (state, action: PayloadAction<LiquidityPool>) => {
      state.selectedPool = action.payload;
    },
    onBinSelect: (state, action: PayloadAction<Bin>) => {
      state.selectedBins = [action.payload];
    },
    onBinsSelect: (state, action: PayloadAction<Bin[]>) => {
      state.selectedBins = action.payload;
    },
    onBinsReset: (state) => {
      state.selectedBins = [];
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
