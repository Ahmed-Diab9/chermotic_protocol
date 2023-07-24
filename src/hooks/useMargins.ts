import { isNil } from 'ramda';
import { useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { PERCENT_DECIMALS } from '~/configs/decimals';
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
        const added = parseUnits(
          formatUnits(position.collateral * position.pnl, token.decimals * 2 + PERCENT_DECIMALS),
          token.decimals
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
