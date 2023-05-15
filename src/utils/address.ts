import { ethers } from "ethers";
import { isValid } from "./valid";

export const ADDRESS_ZERO = ethers.constants.AddressZero;

export const trimAddress = (
  address: string,
  left: number = 5,
  right: number = 5
) => {
  if (!isValid(address)) {
    return;
  }

  return address.slice(0, left) + "..." + address.slice(right * -1);
};
