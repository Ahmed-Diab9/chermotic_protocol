import { isNil, isNotNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';

import { POOL_EVENT } from '~/typings/events';

import { useLpReceipts } from '~/hooks/useLpReceipts';

const formatter = Intl.NumberFormat('en', {
  useGrouping: true,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const usePoolProgressV2 = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [isGuideOpen, setGuideOpen] = useState(false);
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
