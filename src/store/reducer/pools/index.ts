import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LiquidityPool } from "../../../typings/pools";

interface PoolState {
  selectedPool?: LiquidityPool;
}

const initialState: PoolState = {
  selectedPool: undefined,
};

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    onPoolSelect: (state, action: PayloadAction<LiquidityPool>) => {
      state.selectedPool = action.payload;
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
