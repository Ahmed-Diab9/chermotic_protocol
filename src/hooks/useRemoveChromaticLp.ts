import { isNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { dispatchLpEvent } from '~/typings/events';
import { useChromaticClient } from './useChromaticClient';
import { useLpReceipts } from './useLpReceipts';
import { useMarket } from './useMarket';

export const useRemoveChromaticLp = () => {
  const { client, lpClient } = useChromaticClient();
  const { currentMarket } = useMarket();
  const { fetchReceipts } = useLpReceipts();
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
      setIsRemovalPending(true);
      const parsedAmount = parseUnits(amount, selectedLp.decimals);
      const lp = lpClient.lp();
      const isClpApproved = await lp.approveLpTokenToLp(selectedLp.address, parsedAmount);
      if (!isClpApproved) {
        throw new Error('CLP approval failed.');
      }
      const removalResponse = await lp.removeLiquidity(selectedLp.address, parsedAmount);

      await fetchReceipts();

      dispatchLpEvent();
      toast('Removal completed.');

      setIsRemovalPending(false);
    } catch (error) {
      setIsRemovalPending(false);
    }
  };

  return { onRemoveChromaticLp, isRemovalPending };
};
