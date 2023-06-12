import { FEE_RATE_DECIMAL } from "~/configs/decimals";
import { numberBuffer, percentage } from "~/utils/number";

/**
 * @TODO
 * 임의로 제거 가능한 비율을 생성해주는 Mock 함수입니다.
 */
export const createRemovableRateMock = () => {
  const value = Math.ceil(Math.random() * numberBuffer(FEE_RATE_DECIMAL));
  return value / percentage();
};
