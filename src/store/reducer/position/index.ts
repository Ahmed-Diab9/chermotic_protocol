import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { FilterOption } from '~/typings/position';

interface PositionState {
  filterOption: FilterOption;
}

const initialState: PositionState = {
  filterOption: 'ALL',
};

export const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    onOptionSelect: (state, action: PayloadAction<PositionState>) => {
      state.filterOption = action.payload.filterOption;
    },
  },
});

export const positionAction = positionSlice.actions;
export const positionReducer = positionSlice.reducer;
