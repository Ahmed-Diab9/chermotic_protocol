import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LPToken, LiquidityPool } from "../../../typings/pools";

interface PoolState {
  selectedPool?: LiquidityPool;
  selectedLpTokens: LPToken[];
}

const initialState: PoolState = {
  selectedPool: undefined,
  selectedLpTokens: [],
};

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    onPoolSelect: (state, action: PayloadAction<LiquidityPool>) => {
      state.selectedPool = action.payload;
    },
    onLpTokenSelect: (state, action: PayloadAction<LPToken>) => {
      state.selectedLpTokens = [action.payload];
    },
    onLpTokensSelect: (state, action: PayloadAction<LPToken[]>) => {
      state.selectedLpTokens = action.payload;
    },
    onLpTokensReset: (state) => {
      state.selectedLpTokens = [];
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
