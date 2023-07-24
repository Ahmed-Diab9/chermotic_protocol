import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PublicClient, WalletClient } from 'wagmi';
import {
  Client,
  ChromaticLens,
  ChromaticMarketFactory,
  ChromaticMarket,
  ChromaticPosition,
  ChromaticRouter,
  ChromaticAccount,
} from '@chromatic-protocol/sdk-viem';

interface ClientState {
  client: Client;
  lensApi?: ChromaticLens;
  marketFactoryApi?: ChromaticMarketFactory;
  marketApi?: ChromaticMarket;
  positionApi?: ChromaticPosition;
  routerApi?: ChromaticRouter;
  accountApi?: ChromaticAccount;
}

const initialState: ClientState = {
  client: new Client(),
};

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    updatePublicClient: (state, action: PayloadAction<{ publicClient?: PublicClient }>) => {
      state.client.publicClient = action.payload.publicClient as any;
    },
    updateWalletClient: (state, action: PayloadAction<{ walletClient?: WalletClient }>) => {
      state.client.walletClient = action.payload.walletClient as any;

      state.lensApi = state.client.lens();
      state.marketFactoryApi = state.client.marketFactory();
      state.marketApi = state.client.market();
      state.positionApi = state.client.position();
      state.routerApi = state.client.router();
      state.accountApi = state.client.account();
    },
  },
});

export const clientAction = clientSlice.actions;
export const clientReducer = clientSlice.reducer;
