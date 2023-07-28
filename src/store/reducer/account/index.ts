import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ACCOUNT_STATUS } from '~/typings/account';

interface AccountState {
  status: ACCOUNT_STATUS;
}

const initialState: AccountState = {
  status: ACCOUNT_STATUS.NONE,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccountStatus: (state, action: PayloadAction<ACCOUNT_STATUS>) => {
      state.status = action.payload;
    },
  },
});

export const accountAction = accountSlice.actions;
export const accountReducer = accountSlice.reducer;
