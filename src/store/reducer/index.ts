import { accountReducer } from './account';
import { lpReducer } from './lp';
import { marketReducer } from './market';
import { poolsReducer } from './pools';
import { positionReducer } from './position';
import { tokenReducer } from './token';
import { tradesReducer } from './trades';

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
  token: tokenReducer,
  account: accountReducer,
  trades: tradesReducer,
  position: positionReducer,
  lp: lpReducer,
};

export default rootReducer;
