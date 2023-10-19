import { isNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { dispatchLpEvent } from '~/typings/events';
import { useChromaticClient } from './useChromaticClient';

export const useRemoveChromaticLp = () => {
  const { client, lpClient } = useChromaticClient();
  const { address } = useAccount();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
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
      const parsedAmount = parseUnits(amount, selectedLp.decimals);
      const lp = lpClient.lp();
      const isClpApproved = await lp.approveLpTokenToLp(selectedLp.address, parsedAmount);
      if (!isClpApproved) {
        throw new Error('CLP approval failed.');
      }
      const receipt = await lp.removeLiquidity(selectedLp.address, parsedAmount);

      dispatchLpEvent();
      toast('Removal completed.');

      setIsRemovalPending(false);
    } catch (error) {
      setIsRemovalPending(false);
    }
  };

  return { onRemoveChromaticLp, isRemovalPending };
};
