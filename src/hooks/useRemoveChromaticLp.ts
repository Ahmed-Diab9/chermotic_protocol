import { isNil, isNotNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { dispatchLpEvent } from '~/typings/events';
import { useChromaticClient } from './useChromaticClient';
import { useLpReceiptCount } from './useLpReceiptCount';
import { useLpReceipts } from './useLpReceipts';

export const useRemoveChromaticLp = () => {
  const { client, lpClient } = useChromaticClient();
  const { address } = useAccount();
  const { onMutateLpReceipts } = useLpReceipts();
  const { onMutateLpReceiptCount } = useLpReceiptCount();
  const selectedLp = useAppSelector(selectedLpSelector);
  const [isRemovalPending, setIsRemovalPending] = useState(false);

  const onRemoveChromaticLp = async (amount: string) => {
    try {
      if (isNil(address)) {
        return;
      }
      if (isNil(selectedLp)) {
        return;
      }
      if (isNil(client) || isNil(client.publicClient) || isNil(client.walletClient)) {
        toast.error('Connect the wallet.');
        return;
      }
      setIsRemovalPending(true);
      const parsedAmount = parseUnits(amount, selectedLp.clpDecimals);
      const lp = lpClient.lp();
      const isClpApproved = await lp.approveLpTokenToLp(selectedLp.address, parsedAmount);
      if (!isClpApproved) {
        throw new Error('CLP approval failed.');
      }
      const receipt = await lp.removeLiquidity(selectedLp.address, parsedAmount);
      if (isNotNil(receipt)) {
        const timestamp = Math.floor(Date.now() / 1000);
        onMutateLpReceiptCount('burning');
        await onMutateLpReceipts(receipt, selectedLp.address, 'burning', BigInt(timestamp));
      }
      dispatchLpEvent();
      toast('Removal process started.');

      setIsRemovalPending(false);
    } catch (error) {
      setIsRemovalPending(false);
    }
  };

  return { onRemoveChromaticLp, isRemovalPending };
};
