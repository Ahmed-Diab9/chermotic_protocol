import { IERC20__factory } from '@chromatic-protocol/sdk/contracts';
import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { useAppSelector } from '../store';
import { Logger } from '../utils/log';
import { expandDecimals } from '../utils/number';
import { isValid } from '../utils/valid';
import { useUsumAccount } from './useUsumAccount';
import { useChromaticClient } from './useChromaticClient';
import { toast } from 'react-toastify';
const logger = Logger('useTokenTransaction');
const useTokenTransaction = () => {
  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();
  const { accountAddress: chromaticAccountAddress, fetchBalances: fetchChromaticBalances } =
    useUsumAccount();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { client } = useChromaticClient();
  const accountApi = useMemo(() => client?.account(), [client]);
  const [amount, setAmount] = useState('');
  const tokenContract = useMemo(() => {
    if (isValid(token) && isValid(signer)) {
      return IERC20__factory.connect(token.address, signer);
    }
  }, [token, signer]);

  const onDeposit = useCallback(async () => {
    logger.info('onDeposit called');
    if (!isValid(walletAddress) || !isValid(chromaticAccountAddress)) {
      logger.info('no addresses selected');
      toast('Addresses are not selected.');
      return;
    }
    if (!isValid(token)) {
      logger.info('token are not selected');
      toast('Settlement token is not selected.');
      return;
    }
    const expanded = BigNumber.from(amount).mul(expandDecimals(token.decimals));
    if (!isValid(expanded)) {
      logger.info('invalid amount', expanded);
      toast('Amount is not valid.');
      return;
    }
    await tokenContract?.transfer(chromaticAccountAddress, expanded);

    await fetchChromaticBalances();
  }, [amount, walletAddress, chromaticAccountAddress]);

  const onWithdraw = useCallback(async () => {
    if (!isValid(chromaticAccountAddress)) {
      logger.info('contract is not ready');
      toast('Create your account.');
      return;
    }
    if (!isValid(token)) {
      logger.info('token are not selected');
      toast('Settlement token are not selected.');
      return;
    }
    const expanded = BigNumber.from(amount).mul(expandDecimals(token.decimals));
    if (!isValid(expanded)) {
      logger.info('invalid amount', expanded);
      toast('Amount is not valid.');
      return;
    }
    await accountApi?.contracts().account().withdraw(token.address, expanded);
    await fetchChromaticBalances();
  }, [chromaticAccountAddress, token, amount]);

  const onAmountChange = useCallback((nextValue: string) => {
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    logger.info('set amount', nextValue);
    setAmount(nextValue);
  }, []);
  return { amount, onAmountChange, onDeposit, onWithdraw } as const;
};

export default useTokenTransaction;
