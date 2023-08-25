import { useEffect, useState } from 'react';

export function useLiquidityItems() {
  const [arrowState, setArrowState] = useState({
    isScrolled: false,
    hasSameHeight: false,
  });
  useEffect(() => {
    const bins = document.querySelector('#bins');
    if (bins === undefined || bins === null) return;
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

  const liquidityItems = [
    {
      key: 'CHRM - ETH / USD -0.1%',
      image: '',
      tokenName: 'CHRM',
      clbTokenName: 'CHRM - ETH / USD -0.1%',
      qty: '500.00',
      progress: 20,
      progressMax: 500,
      removable: '500.00',
      removableRate: '100.00',
      utilized: '0.00',
      utilizedRate: '0.00',
    },
    {
      key: 'CHRM - ETH / USD -0.2%',
      image: '',
      tokenName: 'CHRM',
      clbTokenName: 'CHRM - ETH / USD -0.2',
      qty: '500.00',
      progress: 20,
      progressMax: 500,
      removable: '500.00',
      removableRate: '100.00',
      utilized: '0.00',
      utilizedRate: '0.00',
    },
  ];

  return {
    isScrollTriggerVisible,
    isScrollTriggerHasOpacity,
    onScrollLiquidityWrapper,
    liquidityItems,
  };
}
