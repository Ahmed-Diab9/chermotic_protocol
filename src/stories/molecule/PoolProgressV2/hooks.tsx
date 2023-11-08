import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useChromaticLp } from '~/hooks/useChromaticLp';
import { useLastOracle } from '~/hooks/useLastOracle';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useLpReceiptCount } from '~/hooks/useLpReceiptCount';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { LP_EVENT, LP_RECEIPT_EVENT } from '~/typings/events';
import { LpReceipt, ReceiptAction } from '~/typings/lp';

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { fetchBalances } = useChromaticAccount();
  const { formattedElapsed } = useLastOracle();
  const [receiptAction, setReceiptAction] = useState<ReceiptAction>('all');
  const {
    receiptsData = [],
    isReceiptsLoading,
    onFetchNextLpReceipts,
    onRefreshLpReceipts,
  } = useLpReceipts({
    currentAction: receiptAction,
  });
  const { refreshChromaticLp } = useChromaticLp();
  const {
    counts = {
      minting: 0,
      burning: 0,
      mintingSettled: 0,
      burningSettled: 0,
      inProgress: 0,
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
        return currentSize < counts.minting + counts.burning;
      }
      case 'minting': {
        return currentSize < counts.minting;
      }
      case 'burning': {
        return currentSize < counts.burning;
      }
    }
  }, [counts, receiptAction, receipts]);
  const { state: storedIsGuideOpen, setState: setIsGuideOpen } = useLocalStorage(
    'app:isLpGuideOpen',
    false
  );
  const isGuideOpens = useMemo<Record<ReceiptAction, boolean>>(() => {
    if (!storedIsGuideOpen) {
      return {
        all: false,
        minting: false,
        burning: false,
      };
    }
    return {
      all: counts.inProgress > 0,
      minting: counts.minting > counts.mintingSettled,
      burning: counts.burning > counts.burningSettled,
    };
  }, [storedIsGuideOpen, counts]);
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

      fetchBalances();
      refreshChromaticLp();
    }
    window.addEventListener(LP_RECEIPT_EVENT, onLpReceiptRefresh);
    return () => {
      window.removeEventListener(LP_RECEIPT_EVENT, onLpReceiptRefresh);
    };
  }, [onRefreshLpReceipts, onRefreshLpReceiptCount, fetchBalances, refreshChromaticLp]);

  return {
    openButtonRef,
    ref,
    isGuideOpens,
    formattedElapsed,
    receipts,
    receiptAction,
    hasMoreReceipts,
    counts,

    onActionChange,
    onGuideClose,
    onFetchNextLpReceipts,
  };
};
