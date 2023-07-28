import { marketReducer } from './market';
import { poolsReducer } from './pools';
import { tokenReducer } from './token';
import { accountReducer } from './account';

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
  token: tokenReducer,
  account: accountReducer,
};

export default rootReducer;
