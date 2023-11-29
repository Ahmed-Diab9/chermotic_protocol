import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import useMarkets from '~/hooks/commons/useMarkets';
import { useChromaticLp } from '~/hooks/useChromaticLp';
import { useLastOracle } from '~/hooks/useLastOracle';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useLpReceiptCount } from '~/hooks/useLpReceiptCount';
import { useLpReceipts } from '~/hooks/useLpReceipts';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useAppDispatch, useAppSelector } from '~/store';
import { lpAction } from '~/store/reducer/lp';
import { receiptActionSelector } from '~/store/selector';
import { LP_EVENT, LP_RECEIPT_EVENT } from '~/typings/events';
import { LpReceipt, ReceiptAction } from '~/typings/lp';

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { fetchTokenBalances } = useTokenBalances();
  const { currentMarket } = useMarkets();
  const { formattedElapsed } = useLastOracle({
    market: currentMarket,
    format: ({ type, value }) => {
      switch (type) {
        case 'hour': {
          return `${value}h`;
        }
        case 'minute': {
          return `${value}m`;
        }
        case 'second': {
          return `${value}s`;
        }
        case 'literal': {
          return ' ';
        }
        case 'dayPeriod': {
          return '';
        }
        default:
          return value;
      }
    },
  });
  const receiptAction = useAppSelector(receiptActionSelector);
  const dispatch = useAppDispatch();
  const {
    receiptsData = [],
    isReceiptsLoading,
    onFetchNextLpReceipts,
    onRefreshLpReceipts,
  } = useLpReceipts();
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
        dispatch(lpAction.onActionSelect('all'));
        break;
      }
      case 1: {
        dispatch(lpAction.onActionSelect('minting'));
        break;
      }
      case 2: {
        dispatch(lpAction.onActionSelect('burning'));
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
    function onLpReceiptUpdate() {
      onRefreshLpReceipts();
      onRefreshLpReceiptCount();

      fetchTokenBalances();
      refreshChromaticLp();
    }
    window.addEventListener(LP_RECEIPT_EVENT, onLpReceiptUpdate);
    return () => {
      window.removeEventListener(LP_RECEIPT_EVENT, onLpReceiptUpdate);
    };
  }, [onRefreshLpReceipts, onRefreshLpReceiptCount, fetchTokenBalances, refreshChromaticLp]);

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
