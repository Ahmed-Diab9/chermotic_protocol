import { isNil } from 'ramda';
import { OracleVersion } from '~/typings/oracleVersion';
import { Position } from '~/typings/position';

export const compareOracles = (previousOracle?: OracleVersion, currentOracle?: OracleVersion) => {
  if (
    isNil(previousOracle) ||
    isNil(currentOracle) ||
    previousOracle.price === currentOracle.price
  ) {
    return '';
  }
  if (previousOracle.price < currentOracle.price) {
    return 'text-price-higher';
  }
  if (previousOracle.price < currentOracle.price) {
    return 'text-price-lower';
  }
};

export const comparePrices = (position: Position, type: 'toProfit' | 'toLoss') => {
  if (position.qty > 0n && type === 'toProfit') {
    return `!text-price-higher`;
  }
  if (position.qty > 0n && type === 'toLoss') {
    return `!text-price-lower`;
  }
  if (position.qty < 0n && type === 'toProfit') {
    return `!text-price-lower`;
  }
  if (position.qty < 0n && type === 'toLoss') {
    return `!text-price-higher`;
  }
  return '';
};
