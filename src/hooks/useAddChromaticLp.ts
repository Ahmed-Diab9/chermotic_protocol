import { isNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { dispatchLpEvent, dispatchLpReceiptEvent } from '~/typings/events';
import useMarkets from './commons/useMarkets';
import { useChromaticClient } from './useChromaticClient';

export const useAddChromaticLp = () => {
  const { client, lpClient, isReady } = useChromaticClient();
  const { currentMarket } = useMarkets();
  const { address } = useAccount();
  const selectedLp = useAppSelector(selectedLpSelector);
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
      const parsedAmount = parseUnits(amount, selectedLp.clpDecimals);
      const isApproved = await lp.approveSettlementTokenToLp(selectedLp.address, parsedAmount);
      if (!isApproved) {
        throw new Error('Settlement token approval failed.');
      }
      const receipt = await lp.addLiquidity(selectedLp.address, parsedAmount, address);

      dispatchLpEvent();
      dispatchLpReceiptEvent();
      toast('Add process started.');
      setIsAddPending(false);
    } catch (error) {
      setIsAddPending(false);
    }
  };

  return { onAddChromaticLp, isAddPending };
};
