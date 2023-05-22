import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { bigNumberify } from "../../../utils/number";
import { LPToken } from "../../../typings/pools";
import { isValid } from "../../../utils/valid";

interface PoolState {
  type: "ADD" | "REMOVE";
  input: BigNumber;
  minTradeFee: BigNumber;
  maxTradeFee: BigNumber;
  selectedLpToken?: LPToken;
  totalMaxLiquidity?: BigNumber;
  totalUnusedLiquidity?: BigNumber;
}

const initialState: PoolState = {
  type: "ADD",
  input: bigNumberify(0),
  minTradeFee: bigNumberify(0),
  maxTradeFee: bigNumberify(0),
  selectedLpToken: undefined,
  totalMaxLiquidity: undefined,
  totalUnusedLiquidity: undefined,
};

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    onTypeToggle: (state, action: PayloadAction<"ADD" | "REMOVE">) => {
      state.type = action.payload;
    },
    onInputChange: (state, action: PayloadAction<number>) => {
      state.input = bigNumberify(action.payload);
    },
    onTradeFeeChange: (
      state,
      action: PayloadAction<{ minmax: "MIN" | "MAX"; value: number }>
    ) => {
      const { minmax, value } = action.payload;
      switch (minmax) {
        case "MIN": {
          state.minTradeFee = bigNumberify(value);
          break;
        }
        case "MAX": {
          state.maxTradeFee = bigNumberify(value);
          break;
        }
      }
    },
    onLpTokenSelect: (state, action: PayloadAction<LPToken>) => {
      state.selectedLpToken = action.payload;
    },
    onTotalLiquidityChange: (
      state,
      action: PayloadAction<
        Partial<{ totalMax: BigNumber; totalUnused: BigNumber }>
      >
    ) => {
      const { totalMax, totalUnused } = action.payload;
      if (isValid(totalMax)) {
        state.totalMaxLiquidity = totalMax;
      }
      if (isValid(totalUnused)) {
        state.totalUnusedLiquidity = totalUnused;
      }
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
