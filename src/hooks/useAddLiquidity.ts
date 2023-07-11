import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useAppSelector } from '../store';
import { Logger, errorLog } from '../utils/log';
import { expandDecimals } from '../utils/number';
import { isValid } from '../utils/valid';
import { useTokenBalances } from './useTokenBalance';
import { useChromaticClient } from './useChromaticClient';
import usePoolReceipt from './usePoolReceipt';
import { PoolEvent } from '~/typings/events';
import { toast } from 'react-toastify';
import { isNil } from 'ramda';

const logger = Logger('useAddLiquidity');

interface Props {
  amount?: string;
  binFeeRates?: number[];
}

function useAddLiquidity(props: Props) {
  const { amount, binFeeRates } = props;
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { client } = useChromaticClient();
  const routerApi = client?.router();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

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
    if (!isValid(walletClient)) {
      errorLog('signer is invalid');
      toast('No signers. Create your account.');
      return;
    }
    if (!isValid(token)) {
      errorLog('token is not selected');
      toast('Settlement token is not selected.');
      return;
    }
    if (!isValid(market)) {
      errorLog('market is not selected');
      toast('Market is not selected.');
      return;
    }
    if (!isValid(address)) {
      errorLog('wallet not connected');
      toast('Wallet is not connected.');
      return;
    }
    if (!isValid(routerApi)) {
      errorLog('no router apis');
      toast('No routers');
      return;
    }
    setIsLoading(true);
    try {
      const marketAddress = market?.address;
      // FIXME
      const expandedAmount = BigInt(Number(amount) * 100000) * expandDecimals(token.decimals - 5);
      if (!isValid(expandedAmount)) {
        errorLog('amount is invalid');
        return;
      }
      const dividedAmount = expandedAmount / BigInt(binFeeRates.length);

      await routerApi.addLiquidities(
        marketAddress,
        binFeeRates.map((feeRate: any) => ({
          feeRate: +(feeRate * 10 ** 2).toFixed(0),
          amount: dividedAmount,
        }))
      );

      await fetchReceipts();
      await fetchWalletBalances();
      window.dispatchEvent(PoolEvent);
      toast('New liquidity is added. Claim your CLB.');
    } catch (error) {
      toast((error as any).reason);
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
