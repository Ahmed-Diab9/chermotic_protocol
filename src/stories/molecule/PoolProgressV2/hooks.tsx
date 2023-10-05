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
  const onReceiptResolve = async (receiptId: bigint) => {
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
  const receiptsInProgress = receipts?.filter((receipt) => !receipt.isClosed);

  return {
    openButtonRef,
    ref,
    isGuideOpen,
    isFullLoaded,

    formattedElapsed,
    receipts: isFullLoaded['all'] ? receipts : receipts?.slice(0, 2),
    mintingReceipts: isFullLoaded['minting'] ? mintingReceipts : mintingReceipts?.slice(0, 2),
    burningReceipts: isFullLoaded['burning'] ? burningReceipts : burningReceipts?.slice(0, 2),
    inProgressLength: receiptsInProgress?.length ?? 0,
    mintingReceiptsLength: mintingReceipts?.length ?? 0,
    burningReceiptsLength: burningReceipts?.length ?? 0,

    onReceiptResolve,
    onFullReceiptsLoad,
  };
};
