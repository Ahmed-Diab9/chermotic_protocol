import { isNil } from 'ramda';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { PERCENT_DECIMALS } from '~/configs/decimals';
import { useAppSelector } from '~/store';
import { usePosition } from './usePosition';
import { useUsumAccount } from './useUsumAccount';

export function useMargins() {
  const { positions = [] } = usePosition();
  const { balances } = useUsumAccount();

  const token = useAppSelector((state) => state.token.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (isNil(balances) || isNil(token) || Object.keys(balances).length <= 0) {
      return [undefined, undefined];
    }
    const balance = balances[token.address];
    const [totalCollateral, totalCollateralAdded] = positions.reduce(
      (record, position) => {
        const added = formatUnits(
          position.collateral * position.pnl,
          token.decimals + PERCENT_DECIMALS
        ).split('.')[0];

        return [record[0] + position.collateral, record[1] + BigInt(added)];
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
