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

    formattedElapsed,
    receipts,
    mintingReceipts,
    burningReceipts,
  };
};
