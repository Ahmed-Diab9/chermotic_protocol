import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '~/store';
import { positionAction } from '~/store/reducer/position';
import { FilterOption } from '~/typings/position';
import useMarkets from './commons/useMarkets';
import useLocalStorage from './useLocalStorage';
import { useSettlementToken } from './useSettlementToken';

export const usePositionFilter = () => {
  const filterOption = useAppSelector((state) => state.position.filterOption);
  const { state: storedFilterOption, setState: setStoredFilterOption } =
    useLocalStorage<FilterOption>('app:position', 'MARKET_ONLY');

  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarkets();
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
