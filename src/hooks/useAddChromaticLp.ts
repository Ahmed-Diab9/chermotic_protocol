import { isNil, isNotNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { dispatchLpEvent } from '~/typings/events';
import useMarkets from './commons/useMarkets';
import { useChromaticClient } from './useChromaticClient';
import { useLpReceiptCount } from './useLpReceiptCount';
import { useLpReceipts } from './useLpReceipts';

export const useAddChromaticLp = () => {
  const { client, lpClient, isReady } = useChromaticClient();
  const { currentMarket } = useMarkets();
  const { onMutateLpReceipts } = useLpReceipts();
  const { onMutateLpReceiptCount } = useLpReceiptCount();
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
      if (isNotNil(receipt)) {
        const timestamp = Math.floor(Date.now() / 1000);
        onMutateLpReceiptCount('minting');
        await onMutateLpReceipts(receipt, selectedLp.address, 'minting', BigInt(timestamp));
      }
      dispatchLpEvent();
      toast('Add process started.');
      setIsAddPending(false);
    } catch (error) {
      setIsAddPending(false);
    }
  };

  return { onAddChromaticLp, isAddPending };
};
