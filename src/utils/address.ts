import { zeroAddress } from 'viem';

export const ADDRESS_ZERO = zeroAddress;

export const trimAddress = (address: string, left: number = 5, right: number = 5) => {
  return address.slice(0, left) + '...' + address.slice(right * -1);
};
