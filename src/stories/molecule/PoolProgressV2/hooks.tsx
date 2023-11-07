import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useLpReceiptCount } from '~/hooks/useLpReceiptCount';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { LP_EVENT, LP_RECEIPT_EVENT } from '~/typings/events';
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
      mintingSettleds: 0,
      burningSettleds: 0,
      inProgresses: 0,
    },
    isCountLoading,
    onRefreshLpReceiptCount,
  } = useLpReceiptCount();

  const receipts: LpReceipt[] = useMemo(() => {
    const receipts = receiptsData?.map(({ receipts }) => receipts).flat(1) ?? [];
    return receipts;
  }, [receiptsData]);
  const hasMoreReceipts = useMemo(() => {
    const currentSize = receipts.length;
    switch (receiptAction) {
      case 'all': {
        return currentSize < count.mintings + count.burnings;
      }
      case 'minting': {
        return currentSize < count.mintings;
      }
      case 'burning': {
        return currentSize < count.burnings;
      }
    }
  }, [count, receiptAction, receipts]);
  const { state: storedIsGuideOpen, setState: setIsGuideOpen } = useLocalStorage(
    'app:isLpGuideOpen',
    false
  );
  const isGuideOpens = useMemo(() => {
    if (!storedIsGuideOpen) {
      return {
        all: false,
        minting: false,
        burning: false,
      };
    }
    return {
      all: count.inProgresses > 0,
      minting: count.mintings > count.mintingSettleds,
      burning: count.burnings > count.burningSettleds,
    };
  }, [storedIsGuideOpen, count]);
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
        openButtonRef.current.click();
      }
      setIsGuideOpen(true);
    }
    window.addEventListener(LP_EVENT, onLp);
    return () => {
      window.removeEventListener(LP_EVENT, onLp);
    };
  }, [setIsGuideOpen]);

  useEffect(() => {
    function onLpReceiptRefresh() {
      onRefreshLpReceipts();
      onRefreshLpReceiptCount();
    }
    window.addEventListener(LP_RECEIPT_EVENT, onLpReceiptRefresh);
    return () => {
      window.removeEventListener(LP_RECEIPT_EVENT, onLpReceiptRefresh);
    };
  }, [onRefreshLpReceipts, onRefreshLpReceiptCount]);

  return {
    openButtonRef,
    ref,
    isGuideOpen,
    formattedElapsed,
    receipts,
    receiptAction,
    hasMoreReceipts,
    count,

    onActionChange,
    onGuideClose,
    onFetchNextLpReceipts,
  };
};
