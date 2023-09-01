import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { TradeInput } from '~/typings/trade';

interface ITrades extends Omit<TradeInput, 'direction'> {}

const emptyTrade: ITrades = {
  method: 'collateral',
  quantity: 0n,
  collateral: 0n,
  takerMargin: 0n,
  makerMargin: 0n,
  takeProfit: 100,
  stopLoss: 10,
  leverage: 10,
  maxFeeAllowance: 0.03,
};

const initialState = {
  short: emptyTrade,
  long: emptyTrade,
};

type Required<T, K extends keyof T> = Pick<T, K> & Partial<T>;

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    updateTradesState: (state, action: PayloadAction<Required<TradeInput, 'direction'>>) => {
      const { direction, ...newValues } = action.payload;
      state[direction] = { ...state[direction], ...newValues };
    },
    clearTradeState: (state, action: PayloadAction<TradeInput['direction'] | undefined>) => {
      if (action.payload === 'long') {
        state.long = emptyTrade;
      } else if (action.payload === 'short') {
        state.short = emptyTrade;
      } else {
        state.long = emptyTrade;
        state.short = emptyTrade;
      }
    },
  },
});

export const tradesAction = tradesSlice.actions;
export const tradesReducer = tradesSlice.reducer;
