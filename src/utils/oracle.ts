import { isNil } from 'ramda';
import { OracleVersion } from '~/typings/oracleVersion';

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
