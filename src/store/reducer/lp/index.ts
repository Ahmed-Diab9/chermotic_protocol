import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { ChromaticLp } from '~/typings/lp';

interface LpState {
  selectedLp?: ChromaticLp;
}

const initialState: LpState = {
  selectedLp: undefined,
};

export const lpSlice = createSlice({
  name: 'lp',
  initialState,
  reducers: {
    onLpSelect: (state, action: PayloadAction<ChromaticLp>) => {
      state.selectedLp = action.payload;
    },
  },
});

export const lpAction = lpSlice.actions;
export const lpReducer = lpSlice.reducer;
