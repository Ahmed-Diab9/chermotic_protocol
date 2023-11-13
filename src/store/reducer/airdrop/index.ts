import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const filterLabels = ['Today', 'Yesterday', 'All Time'] as const;
const labelMap = {
  Today: 'today',
  Yesterday: 'yesterday',
  'All Time': 'all',
} as const;

interface AirdropState<L extends readonly string[], M extends Record<L[number], string>> {
  filterLabels: L;
  labelMap: M;
  selectedIndex: number;
  selectedLabel: M[L[number]];
}

const createInitialState = <L extends readonly string[], M extends Record<L[number], string>>(
  labels: L,
  map: M
) => {
  return {
    filterLabels: labels,
    labelMap: map,
    selectedIndex: 0,
    selectedLabel: map[labels[0] as L[number]],
  } satisfies AirdropState<L, M>;
};

export const airdropSlice = createSlice({
  name: 'airdrop',
  initialState: createInitialState(filterLabels, labelMap),
  reducers: {
    onLabelSwitch: (state, action: PayloadAction<number>) => {
      const nextIndex = action.payload;
      const nextLabel = state.labelMap[state.filterLabels[nextIndex]];
      return {
        ...state,
        selectedIndex: nextIndex,
        selectedLabel: nextLabel,
      };
    },
  },
});

export const airdropAction = airdropSlice.actions;
export const airdropReducer = airdropSlice.reducer;
