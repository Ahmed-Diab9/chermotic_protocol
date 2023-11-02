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
  const lpTag = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    switch (selectedLp.tag.toLowerCase()) {
      case 'high risk': {
        return 'text-risk-high';
      }
      case 'mid risk': {
        return 'text-risk-mid';
      }
      case 'low risk': {
        return 'text-risk-low';
      }
    }
    return '';
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
    lpTag,
    lpAddress: selectedLp?.address,
    // marketDescription: selectedLp?.market.description,
    onCopyAddress,
  };
};
