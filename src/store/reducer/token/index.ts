import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Token } from "~/typings/market";

interface TokenState {
  selectedToken?: Token;
}

const initialState: TokenState = {
  selectedToken: undefined,
};

export const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    onTokenSelect: (state, action: PayloadAction<Token>) => {
      state.selectedToken = action.payload;
    },
  },
});

export const tokenAction = tokenSlice.actions;
export const tokenReducer = tokenSlice.reducer;
