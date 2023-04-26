import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";
import { bigNumberify } from "../../../utils/number";

export interface TradeState {
  type: "LONG" | "SHORT";
  unit: "CONTRACT" | "COLLATERAL";
  collateral: BigNumber;
  contractQuantity: BigNumber;
  leverage: number;
  takeProfitRatio: BigNumber;
  stopLossRatio: BigNumber;

  // @austin-builds
  // TODO: typing needed
  pools: any[];
  transactionFee: BigNumber;
  priceDistance: BigNumber;
}

const initialState: TradeState = {
  type: "LONG",
  unit: "COLLATERAL",
  collateral: bigNumberify(0),
  contractQuantity: bigNumberify(0),
  leverage: 1,
  takeProfitRatio: bigNumberify(0),
  stopLossRatio: bigNumberify(100),
  pools: [],
  transactionFee: bigNumberify(0),
  priceDistance: bigNumberify(0),
};

export const tradeSlice = createSlice({
  name: "trade",
  initialState,
  reducers: {
    onTypeToggle: (state, action: PayloadAction<"LONG" | "SHORT">) => {
      state.type = action.payload;
    },
    onUnitToggle: (state, action: PayloadAction<"CONTRACT" | "COLLATERAL">) => {
      state.unit = action.payload;
    },
    onCollateralChange: (state, action: PayloadAction<number>) => {
      state.collateral = bigNumberify(action.payload);
    },
    onContractQuantityChange: (state, action: PayloadAction<number>) => {
      state.contractQuantity = bigNumberify(action.payload);
    },
    onLeverageChange: (state, action: PayloadAction<number>) => {
      state.leverage = action.payload;
    },
    onTakeProfitRatioChange: (state, action: PayloadAction<number>) => {
      state.takeProfitRatio = bigNumberify(action.payload);
    },
    onStopLossRatioChange: (state, action: PayloadAction<number>) => {
      state.stopLossRatio = bigNumberify(action.payload);
    },
    onPoolsChange: (state, action: PayloadAction<any[]>) => {
      state.pools = action.payload;
    },
    onTransactionFeeChange: (state, action: PayloadAction<number>) => {
      const parsed = Number(action.payload);
      if (isNaN(parsed)) {
        return state;
      }
      state.transactionFee = bigNumberify(parsed);
    },
    onPriceDistanceChange: (state, action: PayloadAction<number>) => {
      const parsed = Number(action.payload);
      if (isNaN(parsed)) {
        return state;
      }
      state.priceDistance = bigNumberify(parsed);
    },
  },
});

export const tradeAction = tradeSlice.actions;

export const tradeReducer = tradeSlice.reducer;
