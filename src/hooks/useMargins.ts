import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useAppSelector } from '~/store';
import { usePositions } from './usePositions';
import { useUsumAccount } from './useUsumAccount';

export function useMargins() {
  const { allMarket: allPositions } = usePositions();
  const { positions = [] } = allPositions;
  const { balances } = useUsumAccount();

  const token = useAppSelector((state) => state.token.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (isNil(balances) || isNil(token) || Object.keys(balances).length <= 0) {
      return [undefined, undefined];
    }
    const balance = balances[token.address];
    const [totalCollateral, totalCollateralAdded] = positions.reduce(
      (record, position) => {
        return [record[0] + position.collateral, record[1] + position.collateral + position.pnl];
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
