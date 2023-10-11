import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';

import { useChromaticClient } from '~/hooks/useChromaticClient';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useLpReceiptCount } from '~/hooks/useLpReceiptCount';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { useAppSelector } from '~/store';
import { LP_EVENT } from '~/typings/events';
import { LpReceipt } from '~/typings/lp';

const formatter = Intl.NumberFormat('en', {
  useGrouping: true,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { lpClient } = useChromaticClient();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const { formattedElapsed } = useLastOracle();
  const [receiptAction, setReceiptAction] = useState('all' as 'all' | 'minting' | 'burning');
  const { receiptsData = [], onFetchNextLpReceipts } = useLpReceipts({ action: receiptAction });
  const { count, isCountLoading } = useLpReceiptCount();
  const receipts: LpReceipt[] = useMemo(() => {
    const receipts = receiptsData?.map(({ receipts }) => receipts).flat(1) ?? [];
    return receipts;
  }, [receiptsData]);
  const { state: isGuideOpen, setState: setIsGuideOpen } = useLocalStorage(
    'app:isLpGuideClicked',
    true
  );
  const onActionChange = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: {
        setReceiptAction('all');
        break;
      }
      case 1: {
        setReceiptAction('minting');
        break;
      }
      case 2: {
        setReceiptAction('burning');
        break;
      }
    }
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
    formattedElapsed,
    receipts,
    receiptAction,
    count,

    onActionChange,
    onGuideClose,
    onFetchNextLpReceipts,
  };
};
