import { isNil } from 'ramda';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from '~/store';
import { copyText } from '~/utils/clipboard';

export const usePoolDetail = () => {
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const lpTitle = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    return `CLP-${selectedLp.settlementToken.name}-${selectedLp.market.description}`;
  }, [selectedLp]);

  const onCopyAddress = () => {
    if (selectedLp) {
      copyText(selectedLp.address);
    } else {
      toast.error('Select LP first.');
    }
  };

  return {
    lpTitle,
    lpName: selectedLp?.name,
    lpAddress: selectedLp?.address,
    marketDescription: selectedLp?.market.description,
    onCopyAddress,
  };
};
