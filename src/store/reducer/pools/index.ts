import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { bigNumberify } from "../../../utils/number";

interface PoolSlot {
  fee: BigNumber;
  liquidity: BigNumber;
  utilizationRate: BigNumber;
}

interface PoolState {
  type: "ADD" | "REMOVE";
  input: BigNumber;
  totalSize: {
    long: BigNumber;
    short: BigNumber;
  };
  currentSize: {
    long: BigNumber;
    short: BigNumber;
  };
  minTradeFee: BigNumber;
  maxTradeFee: BigNumber;
  slots: PoolSlot[];
}

const initialState: PoolState = {
  type: "ADD",
  input: bigNumberify(0),
  totalSize: {
    long: bigNumberify(0),
    short: bigNumberify(0),
  },
  currentSize: {
    long: bigNumberify(0),
    short: bigNumberify(0),
  },
  minTradeFee: bigNumberify(0),
  maxTradeFee: bigNumberify(0),
  slots: [],
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
    onSlotsChange: (state, action: PayloadAction<PoolSlot[]>) => {
      state.slots = action.payload;
    },
  },
});

export const poolsAction = poolsSlice.actions;
export const poolsReducer = poolsSlice.reducer;
