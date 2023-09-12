import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '~/store';
import { positionAction } from '~/store/reducer/position';
import { FilterOption } from '~/typings/position';
import useLocalStorage from './useLocalStorage';
import { useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

export const usePositionFilter = () => {
  const filterOption = useAppSelector((state) => state.position.filterOption);
  const { state: storedFilterOption, setState: setStoredFilterOption } = useLocalStorage(
    'app:position',
    'ALL' as FilterOption
  );

  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const dispatch = useAppDispatch();

  const filterOptions = useMemo(() => {
    if (isNil(currentToken) || isNil(currentMarket)) {
      return;
    }
    return {
      MARKET_ONLY: `${currentToken.name}-${currentMarket.description}`,
      TOKEN_BASED: `${currentToken.name} based markets`,
      ALL: 'All markets',
    } as Record<FilterOption, string>;
  }, [currentToken, currentMarket]);

  const onOptionSelect = (nextOption: FilterOption) => {
    setStoredFilterOption(nextOption);
    dispatch(positionAction.onOptionSelect({ filterOption: nextOption }));
  };

  return {
    filterOption: storedFilterOption ?? filterOption,
    filterOptions,
    onOptionSelect,
  };
};
