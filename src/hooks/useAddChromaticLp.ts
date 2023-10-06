import { isNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { dispatchLpEvent } from '~/typings/events';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';

export const useAddChromaticLp = () => {
  const { client, lpClient, isReady } = useChromaticClient();
  const { currentMarket } = useMarket();
  const { address } = useAccount();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const [isAddPending, setIsAddPending] = useState(false);

  const onAddChromaticLp = async (amount: string) => {
    try {
      if (isNil(currentMarket)) {
        return;
      }
      if (isNil(selectedLp) || isNil(address)) {
        return;
      }
      if (isNil(client) || isNil(client.publicClient) || isNil(client.walletClient)) {
        toast.error('Connect the wallet.');
        return;
      }
      setIsAddPending(true);
      const lp = lpClient.lp();
      const parsedAmount = parseUnits(amount, selectedLp.decimals);
      const isApproved = await lp.approveSettlementTokenToLp(selectedLp.address, parsedAmount);
      if (!isApproved) {
        throw new Error('Settlement token approval failed.');
      }
      const receipt = await lp.addLiquidity(selectedLp.address, parsedAmount, address);

      dispatchLpEvent();

      toast('Add completed.');
      setIsAddPending(false);
    } catch (error) {
      setIsAddPending(false);
    }
  };

  return { onAddChromaticLp, isAddPending };
};
