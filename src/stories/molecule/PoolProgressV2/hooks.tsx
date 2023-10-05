import { useCallback, useEffect, useRef } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';

import { useChromaticClient } from '~/hooks/useChromaticClient';
import useLocalStorage from '~/hooks/useLocalStorage';
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

  const { lpClient } = useChromaticClient();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const { formattedElapsed } = useLastOracle();
  const { receipts, fetchReceipts } = useLpReceipts();
  const mintingReceipts = receipts?.filter((receipt) => receipt.action === 'minting');
  const burningReceipts = receipts?.filter((receipt) => receipt.action === 'burning');
  const inProgressReceipts = receipts?.filter((receipt) => !receipt.isClosed);
  const { state: isGuideOpen, setState: setIsGuideOpen } = useLocalStorage(
    'app:isLpGuideClicked',
    true
  );
  const onReceiptSettle = async (receiptId: bigint) => {
    if (!selectedLp) {
      return;
    }
    const lp = lpClient.lp();
    const isExecutable = await lp.resolveSettle(selectedLp.address, receiptId);
    if (!isExecutable) {
      return;
    }
    const settleResponse = await lp.settle(selectedLp.address, receiptId);
    await fetchReceipts();
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
    mintingReceipts,
    burningReceipts,
    inProgressReceipts,

    onReceiptSettle,
    onGuideClose,
  };
};
