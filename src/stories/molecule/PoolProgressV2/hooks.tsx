import { isNil, isNotNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';

import { POOL_EVENT } from '~/typings/events';

import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { useAppSelector } from '~/store';
import { LP_EVENT } from '~/typings/events';

const formatter = Intl.NumberFormat('en', {
  useGrouping: true,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [isGuideOpen, setGuideOpen] = useState(false);
  const { lpClient } = useChromaticClient();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const [isFullLoaded, setIsFullLoaded] = useState({
    all: false,
    minting: false,
    burning: false,
  });
  const onFullReceiptsLoad = (type: 'all' | 'minting' | 'burning') => {
    setIsFullLoaded((currentState) => ({
      ...currentState,
      [type]: true,
    }));
  };
  useEffect(() => {
    function onPool() {
      if (isNotNil(openButtonRef.current) && isNil(ref.current)) {
        setGuideOpen(true);
        openButtonRef.current.click();
      }
    }
    window.addEventListener(POOL_EVENT, onPool);
    return () => {
      window.removeEventListener(POOL_EVENT, onPool);
    };
  }, []);
  const { formattedElapsed } = useLastOracle();
  const { receipts } = useLpReceipts();
  const mintingReceipts = receipts?.filter((receipt) => receipt.action === 'minting');
  const burningReceipts = receipts?.filter((receipt) => receipt.action === 'burning');
  const { state: isGuideOpen, setState: setIsGuideOpen } = useLocalStorage(
    'app:isLpGuideClicked',
    true
  );
    if (!selectedLp) {
      return;
    }
    const lp = lpClient.lp();
    const isExecutable = await lp.resolveSettle(selectedLp.address, receiptId);
    if (!isExecutable) {
      return;
    }
    const settleResponse = await lp.settle(selectedLp.address, receiptId);
  };
  const onGuideClose = useCallback(() => setIsGuideOpen(false), [setIsGuideOpen]);

  useEffect(() => {
    function onLp() {
      setIsGuideOpen(true);
    }
    window.addEventListener(LP_EVENT, onLp);
    return () => {
      window.removeEventListener(LP_EVENT, onLp);
    };
  }, [setIsGuideOpen]);

  return {
    openButtonRef,
    ref,
    isGuideOpen,
    isFullLoaded,

    formattedElapsed,
    onGuideClose,
  };
};
