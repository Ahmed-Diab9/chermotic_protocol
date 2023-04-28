import { marketReducer } from "./market";
import { poolsReducer } from "./pools";
import { tradeReducer } from "./trade";

const rootReducer = {
  trade: tradeReducer,
  market: marketReducer,
  pools: poolsReducer,
};

export default rootReducer;
