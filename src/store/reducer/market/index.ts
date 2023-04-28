import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Market, Token } from "../../../typings/market";

interface MarketState {
  markets: Market[];
  tokens: Token[];
  selectedMarket?: Market;
  selectedToken?: Token;
}

const initialState: MarketState = {
  markets: [],
  tokens: [],
  selectedMarket: undefined,
  selectedToken: undefined,
};

export const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    onMarketsUpdate: (state, action: PayloadAction<unknown>) => {
      state.markets = [];
    },
    onTokensUpdate: (state, action: PayloadAction<unknown>) => {
      state.tokens = [];
    },
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
