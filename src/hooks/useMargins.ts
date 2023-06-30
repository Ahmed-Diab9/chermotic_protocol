import { useAppSelector } from '~/store';
import { usePosition } from './usePosition';
import { useUsumAccount } from './useUsumAccount';
import { isNil } from 'ramda';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { expandDecimals } from '~/utils/number';
import { PERCENT_DECIMALS } from '~/configs/decimals';

export function useMargins() {
  const { positions = [] } = usePosition();
  const { balances } = useUsumAccount();

  const token = useAppSelector((state) => state.token.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (isNil(balances) || isNil(token) || Object.keys(balances).length <= 0) {
      return [BigNumber.from(0), BigNumber.from(0)];
    }
    const balance = balances[token.address];
    const [totalCollateral, totalCollateralAdded] = positions.reduce(
      (record, position) => {
        const added = BigNumber.from(position.collateral)
          .mul(position.pnl)
          .div(expandDecimals(token.decimals))
          .div(expandDecimals(PERCENT_DECIMALS));

        return [record[0].add(position.collateral), record[1].add(added)];
      },
      [BigNumber.from(0), BigNumber.from(0)]
    );
    return [balance.add(totalCollateral), balance.add(totalCollateralAdded)];
  }, [balances, token, positions]);

  const totalMargin = useMemo(() => {
    if (isNil(balances) || isNil(token)) {
      return BigNumber.from(0);
    }
    return balances[token.address];
  }, [balances, token]);

  return {
    totalBalance,
    totalAsset,
    totalMargin,
  };
}
