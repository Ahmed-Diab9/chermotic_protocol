import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useChromaticLp } from '~/hooks/useChromaticLp';
import { useAppDispatch, useAppSelector } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { formatDecimals } from '~/utils/number';

export const usePoolMenuV3 = () => {
  const { lpList } = useChromaticLp();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const dispatch = useAppDispatch();

  const onMenuClick = (lpName: string) => {
    const nextLp = lpList?.find((lp) => lp.name === lpName);

    if (isNil(nextLp)) {
      return;
    }
    dispatch(lpAction.onLpSelect(nextLp));
  };

  const formattedLp = useMemo(() => {
    return lpList?.map((lp, lpIndex) => {
      const price = formatDecimals(lp.price, lp.decimals, 2, true);
      const assets = formatDecimals(lp.totalValue, lp.settlementToken.decimals, 2, true);
      return {
        name: lp.name,
        tag: lp.tag,
        price,
        assets,
        label: undefined as string | undefined,
        tokenSymbol: lp.settlementToken.name,
      };
    });
  }, [lpList]);

  return { formattedLp, selectedLp, onMenuClick };
};
