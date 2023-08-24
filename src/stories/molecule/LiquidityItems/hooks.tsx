import { isNil } from 'ramda';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';

import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppSelector } from '~/store';

import { divPreserved, formatDecimals } from '~/utils/number';

export function useLiquidityItems() {
  const [arrowState, setArrowState] = useState({
    isScrolled: false,
    hasSameHeight: false,
  });
  useEffect(() => {
    const bins = document.querySelector('#bins');
    if (isNil(bins)) return;
    if (bins.clientHeight === bins.scrollHeight) {
      setArrowState(() => ({ isScrolled: false, hasSameHeight: true }));
    }
    const onWindowResize = () => {
      if (bins.scrollTop !== 0) {
        setArrowState((state) => ({ ...state, isScrolled: true }));
      } else if (bins.clientHeight === bins.scrollHeight) {
        setArrowState({ isScrolled: false, hasSameHeight: true });
      } else {
        setArrowState({ isScrolled: false, hasSameHeight: false });
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const isScrollTriggerVisible = !arrowState.hasSameHeight;
  const isScrollTriggerHasOpacity = !arrowState.isScrolled;

  const onScrollLiquidityWrapper = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    if (event.target.clientHeight === event.target.scrollHeight) {
      return;
    }
    if (event.target.scrollTop === 0) {
      setArrowState((state) => ({ ...state, isScrolled: false }));
    }
    if (event.target.scrollTop > 0 && !arrowState.isScrolled) {
      setArrowState((state) => ({ ...state, isScrolled: true }));
    }
  };

  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const { currentToken } = useSettlementToken();

  const liquidityItems = selectedBins.map((selectedBin) => {
    const clbRemovable =
      selectedBin.freeLiquidity > selectedBin.clbBalanceOfSettlement
        ? selectedBin.clbBalanceOfSettlement
        : selectedBin.freeLiquidity;
    const clbUtilized = selectedBin.clbBalanceOfSettlement - clbRemovable;
    const clbUtilizedRate =
      selectedBin.clbBalanceOfSettlement !== 0n
        ? formatDecimals(
            divPreserved(
              clbUtilized,
              selectedBin.clbBalanceOfSettlement,
              currentToken?.decimals || 0
            ),
            (currentToken?.decimals || 0) - 2,
            2
          )
        : '0';
    const clbRemovableRate =
      selectedBin.clbBalanceOfSettlement !== 0n
        ? formatDecimals(
            divPreserved(
              clbRemovable,
              selectedBin.clbBalanceOfSettlement,
              currentToken?.decimals || 0
            ),
            (currentToken?.decimals || 2) - 2,
            2
          )
        : '0';

    return {
      key: selectedBin.clbTokenDescription,
      image: selectedBin.clbTokenImage,
      tokenName: currentToken?.name || '-',
      clbTokenName: selectedBin.clbTokenDescription,
      qty: formatDecimals(selectedBin.clbTokenBalance, currentToken?.decimals, 2),
      progress: +formatUnits(clbRemovable, currentToken?.decimals || 0),
      progressMax: +formatUnits(selectedBin.clbBalanceOfSettlement, currentToken?.decimals || 0),
      removable: formatDecimals(clbRemovable, currentToken?.decimals, 2),
      removableRate: clbRemovableRate,
      utilized: formatDecimals(clbUtilized, currentToken?.decimals, 2),
      utilizedRate: clbUtilizedRate,
    };
  });

  return {
    isScrollTriggerVisible,
    isScrollTriggerHasOpacity,
    onScrollLiquidityWrapper,
    liquidityItems,
  };
}
