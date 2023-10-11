import { isNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { dispatchPoolEvent } from '~/typings/events';
import { Logger, errorLog } from '../utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
import usePoolReceipt from './usePoolReceipt';
import { useSettlementToken } from './useSettlementToken';
import { useTokenBalances } from './useTokenBalance';

const logger = Logger('useAddLiquidity');

interface Props {
  amount?: string;
  binFeeRates?: number[];
}

function useAddLiquidity(props: Props) {
  const { amount, binFeeRates } = props;

  const { currentMarket } = useMarket();
  const { currentToken } = useSettlementToken();

  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const { client, walletAddress } = useChromaticClient();

  const [isLoading, setIsLoading] = useState(false);

  const onAddLiquidity = async function () {
    logger.info('add liq');
    if (isNil(amount)) {
      toast('Input amount first.');
      return;
    }
    if (isNil(binFeeRates)) {
      toast('Select fee rates.');
      return;
    }
    if (isNil(currentToken)) {
      errorLog('token is not selected');
      toast('Settlement token is not selected.');
      return;
    }
    if (isNil(currentMarket)) {
      errorLog('market is not selected');
      toast('Market is not selected.');
      return;
    }
    if (isNil(walletAddress)) {
      errorLog('wallet not connected');
      toast('Wallet is not connected.');
      return;
    }
    setIsLoading(true);

    try {
      const marketAddress = currentMarket?.address;
      // FIXME
      const expandedAmount =
        BigInt(Number(amount) * 100000) * parseUnits('1', currentToken.decimals - 5);
      if (isNil(expandedAmount)) {
        errorLog('amount is invalid');
        return;
      }
      const dividedAmount = expandedAmount / BigInt(binFeeRates.length);

      const routerApi = client.router();
      await routerApi.addLiquidities(
        marketAddress,
        binFeeRates.map((feeRate: any) => ({
          feeRate: +(feeRate * 10 ** 2).toFixed(0),
          amount: dividedAmount,
        }))
      );

      await fetchReceipts();
      await fetchWalletBalances();

      dispatchPoolEvent();
      toast('New liquidity is added. Claim your CLB.');
    } catch (error) {
      toast.error('Transaction rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onAddLiquidity,
    isLoading,
  };
}

export { useAddLiquidity };
