import { marketReducer } from "./market";
import { poolsReducer } from "./pools";

const rootReducer = {
  market: marketReducer,
  pools: poolsReducer,
};

export default rootReducer;
