import { marketReducer } from './market';
import { poolsReducer } from './pools';
import { tokenReducer } from './token';
import { accountReducer } from './account';
import { tradesReducer } from './trades';

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
  token: tokenReducer,
  account: accountReducer,
  trades: tradesReducer,
};

export default rootReducer;
