import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { copyText } from '~/utils/clipboard';

export const usePoolDetail = () => {
  const selectedLp = useAppSelector(selectedLpSelector);
  const { client } = useChromaticClient();
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

  const onCLPRegister = useCallback(async () => {
    if (isNil(selectedLp)) {
      return;
    }
    const isAdded = await client.walletClient?.watchAsset({
      type: 'ERC20',
      options: {
        address: selectedLp.address,
        symbol: selectedLp.clpSymbol,
        decimals: selectedLp.clpDecimals,
      },
    });

    if (isAdded) {
      toast('New CLP token was registered.');
    } else {
      toast.error('Failed to register.');
    }
  }, [client.walletClient, selectedLp]);

  return {
    lpTitle,
    lpName: selectedLp?.name,
    lpTag,
    lpAddress: selectedLp?.address,
    // marketDescription: selectedLp?.market.description,
    onCopyAddress,
    onCLPRegister,
  };
};
