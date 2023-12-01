import { isEmpty, isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import { Token } from '~/typings/market';
import { formatDecimals } from '~/utils/number';

export function usePoolPanelV2() {
  const currentToken: Token = {
    name: 'cETH',
    address: '0x1',
    image: '',
    decimals: 18,
    minimumMargin: parseUnits('10', 18),
  };
  const selectedLp = {
    address: '0x12',
    name: 'Crescendo',
    tag: 'Low Risk',
    balance: parseUnits('10', 18),
    image: '',

    price: parseUnits('1.008', 18),
    settlementToken: currentToken,
    minimalAdd: parseUnits('10', 18),
    minimalRemove: parseUnits('10', 18),

    clpName: 'cETH-ETH/USD',
    clpSymbol: 'CLP-0000-L',
    clpDecimals: 18,
  };
  const [selectedTab, setSelectedTab] = useState(0);
  const onTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
    return;
  };
  const [isBinValueVisible, setIsBinValueVisible] = useState(false);
  const tokenBalances: Record<`0x${string}`, bigint> = {
    '0x1': parseUnits('20', 18),
  };
  const selectedBalances = useMemo(() => {
    return {
      add: tokenBalances && currentToken && tokenBalances[currentToken.address],
      remove: selectedLp?.balance,
    };
  }, [tokenBalances, currentToken, selectedLp]);
  const formattedBalances = useMemo(() => {
    return {
      add: formatDecimals(selectedBalances.add, currentToken?.decimals, 2, true),
      remove: formatDecimals(selectedBalances.remove, selectedLp?.clpDecimals, 2, true),
    };
  }, [selectedBalances, currentToken, selectedLp]);

  const maxAmounts = useMemo(() => {
    return {
      add: formatDecimals(
        selectedBalances.add,
        currentToken?.decimals,
        currentToken?.decimals,
        false,
        'trunc'
      ),
      remove: formatDecimals(
        selectedBalances.remove,
        selectedLp?.clpDecimals,
        selectedLp?.clpDecimals,
        false,
        'trunc'
      ),
    };
  }, [currentToken, selectedLp, selectedBalances]);

  const [amounts, setAmounts] = useState({
    add: '',
    remove: '',
  });
  const isUnderMinimals = useMemo(() => {
    if (isNil(currentToken) || isNil(selectedLp)) {
      return {
        add: false,
        remove: false,
      };
    }
    return {
      add:
        amounts.add.length > 0 &&
        parseUnits(amounts.add, currentToken.decimals) < selectedLp.minimalAdd,
      remove:
        amounts.remove.length > 0 &&
        parseUnits(amounts.remove, currentToken.decimals) < selectedLp.minimalRemove,
    };
  }, [currentToken, selectedLp, amounts]);
  const isExceededs = useMemo(() => {
    if (isNil(currentToken) || isNil(selectedLp) || isNil(selectedBalances)) {
      return {
        add: false,
        remove: false,
      };
    }
    return {
      add: parseUnits(amounts.add, currentToken.decimals) > (selectedBalances?.add ?? 0n),
      remove: parseUnits(amounts.remove, selectedLp.clpDecimals) > (selectedBalances?.remove ?? 0n),
    };
  }, [amounts, selectedBalances, currentToken, selectedLp]);
  const errorMessages = useMemo(() => {
    const formattedMinimalAdd = formatDecimals(selectedLp?.minimalAdd, currentToken?.decimals, 3);
    const formattedMinimalRemove = formatDecimals(
      selectedLp?.minimalRemove,
      currentToken?.decimals,
      3
    );
    return {
      add: isExceededs.add
        ? 'Exceeded your wallet balance.'
        : isUnderMinimals.add
        ? `Less than minimum betting amount. (${formattedMinimalAdd} ${currentToken?.name})`
        : undefined,
      remove: isExceededs.remove
        ? 'Exceeded your CLP balance.'
        : isUnderMinimals.remove
        ? // The warning message of minimal amount should be updated
          `Should remove minimal amount at least. (${formattedMinimalRemove} ${currentToken?.name})`
        : undefined,
    };
  }, [isExceededs, isUnderMinimals, selectedLp, currentToken]);

  const formattedClp = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    return formatDecimals(selectedLp.balance, selectedLp.clpDecimals, 2, true);
  }, [selectedLp]);

  const isButtonDisableds = useMemo(() => {
    const isAddDisabled =
      isExceededs.add || isNil(selectedLp) || isEmpty(amounts.add) || amounts.add === '0';
    const isRemoveDisabled =
      isExceededs.remove || isNil(selectedLp) || isEmpty(amounts.remove) || amounts.remove === '0';
    return {
      add: isAddDisabled,
      remove: isRemoveDisabled,
    };
  }, [selectedLp, amounts, isExceededs]);

  const onAmountChange = (value: string) => {
    if (value.length === 0) {
      switch (selectedTab) {
        case 0: {
          setAmounts((state) => ({
            ...state,
            add: '',
          }));
          break;
        }
        case 1: {
          setAmounts((state) => ({
            ...state,
            remove: '',
          }));
          break;
        }
      }
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return;
    }
    switch (selectedTab) {
      case 0: {
        setAmounts((state) => ({
          ...state,
          add: value,
        }));
        break;
      }
      case 1: {
        setAmounts((state) => ({
          ...state,
          remove: value,
        }));
        break;
      }
    }
    return;
  };
  return {
    selectedTab,
    onTabChange,
    setIsBinValueVisible,

    shortUsedLp: '10.5M',
    shortMaxLp: '12M',
    longUsedLp: '8.5M',
    longMaxLp: '10M',
    isBinValueVisible,

    isAssetsLoading: true,
    isLpLoading: isNil(selectedLp),
    isExceededs,
    isUnderMinimals,
    errorMessages,
    isButtonDisableds,
    amounts,
    maxAmounts,
    formattedBalances,
    formattedClp,
    isAddPending: false,
    isRemovalPending: false,
    onAmountChange,
    onAddChromaticLp: () => {},
    onRemoveChromaticLp: () => {},

    tokenName: currentToken.name,
    tokenImage: currentToken.image,
    clpName: selectedLp.clpName,
    clpImage: selectedLp.image,
  };
}
