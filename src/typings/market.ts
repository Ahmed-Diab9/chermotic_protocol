import { IOracleProvider } from '@chromatic-protocol/sdk-ethers-v5/contracts';
import { BigNumber } from 'ethers';

export interface Token {
  name: string;
  address: string;
  decimals: number;
}

export interface Price {
  value: BigNumber;
  decimals: number;
}

export interface Market {
  address: string;
  description: string;
  oracleValue: Pick<IOracleProvider.OracleVersionStructOutput, 'timestamp' | 'version' | 'price'>;
}
