import { useAppSelector } from '~/store';
import { usePosition } from './usePosition';
import { useUsumAccount } from './useUsumAccount';
import { isNil } from 'ramda';
import { useMemo } from 'react';
import { expandDecimals } from '~/utils/number';
import { PERCENT_DECIMALS } from '~/configs/decimals';

export function useMargins() {
  const { positions = [] } = usePosition();
  const { balances } = useUsumAccount();

  const token = useAppSelector((state) => state.token.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (isNil(balances) || isNil(token) || Object.keys(balances).length <= 0) {
      return [0n, 0n];
    }
    const balance = balances[token.address];
    const [totalCollateral, totalCollateralAdded] = positions.reduce(
      (record, position) => {
        const added =
          (position.collateral * position.pnl) /
          expandDecimals(token.decimals) /
          expandDecimals(PERCENT_DECIMALS);

        return [record[0] + position.collateral, record[1] + added];
      },
      [0n, 0n]
    );
    return [balance + totalCollateral, balance + totalCollateralAdded];
  }, [balances, token, positions]);

  const totalMargin = useMemo(() => {
    if (isNil(balances) || isNil(token)) {
      return 0n;
    }
    return balances[token.address];
  }, [balances, token]);

  return {
    totalBalance,
    totalAsset,
    totalMargin,
  };
}
