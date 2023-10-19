import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useLpReceiptCount } from '~/hooks/useLpReceiptCount';
import { useLpReceiptEvents } from '~/hooks/useLpReceiptEvents';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { LP_EVENT } from '~/typings/events';
import { LpReceipt } from '~/typings/lp';

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { formattedElapsed } = useLastOracle();
  const [receiptAction, setReceiptAction] = useState('all' as 'all' | 'minting' | 'burning');
  const {
    receiptsData = [],
    onFetchNextLpReceipts,
    onRefreshLpReceipts,
  } = useLpReceipts({
    currentAction: receiptAction,
  });
  const {
    count = {
      mintings: 0,
      burnings: 0,
      inProgresses: 0,
    },
    isCountLoading,
    onRefreshLpReceiptCount,
  } = useLpReceiptCount();
  useLpReceiptEvents({ callbacks: [onRefreshLpReceipts, onRefreshLpReceiptCount] });

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
      if (isNotNil(openButtonRef.current) && isNil(ref.current)) {
        setIsGuideOpen(true);
        openButtonRef.current.click();
      }
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
