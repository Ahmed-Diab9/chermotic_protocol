import { isNil } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '~/store';
import { positionAction } from '~/store/reducer/position';
import { FilterOption } from '~/typings/position';
import useLocalStorage from './useLocalStorage';

export const usePositionFilterLocal = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { state: storedFilterOption, setState: setStoredFilterOption } = useLocalStorage(
    'app:position',
    'MARKET_ONLY' as FilterOption
  );

  const dispatch = useAppDispatch();

  const onOptionSelect = useCallback(
    (nextOption: FilterOption) => {
      setStoredFilterOption(nextOption);
      dispatch(positionAction.onOptionSelect({ filterOption: nextOption }));
    },
    [dispatch, setStoredFilterOption]
  );

  useEffect(() => {
    if (isNil(storedFilterOption) || isLoaded) {
      return;
    }

    onOptionSelect(storedFilterOption);
    setIsLoaded(true);
  }, [isLoaded, storedFilterOption, onOptionSelect]);
};
