import { Position } from "~/typings/position";

const positions: Position[] = [];

export const createPositionsMock = async () => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null!);
    }, 3000);
  });
  return positions;
};
