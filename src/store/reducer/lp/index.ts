import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { ChromaticLp, ReceiptAction } from '~/typings/lp';

interface LpState {
  selectedLp?: ChromaticLp;
  receiptAction: ReceiptAction;
}

const initialState: LpState = {
  selectedLp: undefined,
  receiptAction: 'all',
};

export const lpSlice = createSlice({
  name: 'lp',
  initialState,
  reducers: {
    onLpSelect: (state, action: PayloadAction<ChromaticLp>) => {
      state.selectedLp = action.payload;
    },
    onLpUnselect: (state) => {
      state.selectedLp = undefined;
    },
    onActionSelect: (state, action: PayloadAction<ReceiptAction>) => {
      state.receiptAction = action.payload;
    },
  },
});

export const lpAction = lpSlice.actions;
export const lpReducer = lpSlice.reducer;
