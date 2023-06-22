import { marketReducer } from "./market";
import { poolsReducer } from "./pools";
import { tokenReducer } from "./token";

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
  token: tokenReducer,
};

export default rootReducer;
