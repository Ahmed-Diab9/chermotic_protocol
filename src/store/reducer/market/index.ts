import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Market, Token } from "../../../typings/market";

interface MarketState {
  selectedMarket?: Market;
  selectedToken?: Token;
}

const initialState: MarketState = {
  selectedMarket: undefined,
  selectedToken: undefined,
};

export const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    onTokenSelect: (state, action: PayloadAction<Token>) => {
      state.selectedToken = action.payload;
    },
    onMarketSelect: (state, action: PayloadAction<Market>) => {
      state.selectedMarket = action.payload;
    },
  },
});

export const marketAction = marketSlice.actions;
export const marketReducer = marketSlice.reducer;
