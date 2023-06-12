import { FEE_RATE_DECIMAL } from "~/configs/decimals";

/**
 * @TODO
 * 임의로 제거 가능한 비율을 생성해주는 Mock 함수입니다.
 */
export const createRemovableRateMock = () => {
  const value = Math.ceil(Math.random() * 1000);
  return value / 10;
};
