import { SLOT_VALUE_DECIMAL } from "../configs/pool";
import { bigNumberify, expandDecimals } from "../utils/number";

export const createSlotValueMock = () => {
  const value = Math.ceil(Math.random() * 1000);
  const isPositive = Math.random() > 0.5;

  if (isPositive) {
    return bigNumberify(value).add(expandDecimals(SLOT_VALUE_DECIMAL));
  } else {
    return bigNumberify(value).mul(-1).add(expandDecimals(SLOT_VALUE_DECIMAL));
  }
};
