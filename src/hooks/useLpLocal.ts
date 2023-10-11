import { isNotNil } from 'ramda';
import { useCallback, useEffect } from 'react';
import { Address } from 'wagmi';
import { useAppDispatch } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { useChromaticLp } from './useChromaticLp';
import useLocalStorage from './useLocalStorage';

export const useLpLocal = () => {
  const { lpList, isLpLoading } = useChromaticLp();
  const dispatch = useAppDispatch();
  const { state: storedLpAddress } = useLocalStorage<Address>('app:lp');

  const onMount = useCallback(() => {
    if (isLpLoading) {
      return;
    }
    let lp = lpList?.find((lp) => lp.address === storedLpAddress);
    if (isNotNil(lp)) {
      dispatch(lpAction.onLpSelect(lp));
      return;
    }
    lp = lpList?.[0];
    if (isNotNil(lp)) {
      dispatch(lpAction.onLpSelect(lp));
      return;
    }
  }, [lpList, isLpLoading, storedLpAddress]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
