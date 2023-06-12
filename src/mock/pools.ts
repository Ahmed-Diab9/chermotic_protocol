import { BIN_VALUE_DECIMAL } from "../configs/pool";
import { bigNumberify, expandDecimals } from "../utils/number";

export const createBinValueMock = () => {
  const value = Math.ceil(Math.random() * 1000);
  const isPositive = Math.random() > 0.5;

  if (isPositive) {
    return bigNumberify(value).add(expandDecimals(BIN_VALUE_DECIMAL));
  } else {
    return bigNumberify(value).mul(-1).add(expandDecimals(BIN_VALUE_DECIMAL));
  }
};

/**
 * @TODO
 * 임의로 제거 가능한 비율을 생성해주는 Mock 함수입니다.
 */
export const createRemovableRateMock = () => {
  const value = Math.ceil(Math.random() * 1000);
  return value / 10;
};
