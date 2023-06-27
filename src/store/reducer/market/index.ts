import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Market } from "~/typings/market";

interface MarketState {
  selectedMarket?: Market;
}

const initialState: MarketState = {
  selectedMarket: undefined,
};

export const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    onMarketSelect: (state, action: PayloadAction<Market>) => {
      state.selectedMarket = action.payload;
    },
  },
});

export const marketAction = marketSlice.actions;
export const marketReducer = marketSlice.reducer;
