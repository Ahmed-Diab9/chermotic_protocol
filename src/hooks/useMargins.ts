import { isNil } from 'ramda';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { PERCENT_DECIMALS } from '~/configs/decimals';
import { useAppSelector } from '~/store';
import { toBigInt } from '~/utils/number';
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
        const added = toBigInt(
          formatUnits(position.collateral * position.pnl, token.decimals + PERCENT_DECIMALS)
        );

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
