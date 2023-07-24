import { marketReducer } from './market';
import { poolsReducer } from './pools';
import { tokenReducer } from './token';
import { clientReducer } from './client';

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
  token: tokenReducer,
  client: clientReducer,
};

export default rootReducer;
