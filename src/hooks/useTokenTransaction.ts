import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractWrite, useWalletClient } from 'wagmi';
import { useAppSelector } from '../store';
import { Logger } from '../utils/log';
import { expandDecimals } from '../utils/number';
import { isValid } from '../utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useUsumAccount } from './useUsumAccount';
const logger = Logger('useTokenTransaction');

const useTokenTransaction = () => {
  const { address: walletAddress } = useAccount();
  const { accountAddress: chromaticAccountAddress, fetchBalances: fetchChromaticBalances } =
    useUsumAccount();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { client } = useChromaticClient();
  const accountApi = useMemo(() => client?.account(), [client]);
  const [amount, setAmount] = useState('');
  const { data: walletClient } = useWalletClient();
  const { data: tokenContractData, write: transferToken } = useContractWrite({
    abi: ierc20ABI,
    address: token?.address,
    functionName: 'transfer',
  });

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
    const trimmedAmount = BigInt(Math.floor(Number(amount) * 100));
    const expanded = trimmedAmount * expandDecimals(token.decimals - 2);
    if (!isValid(expanded)) {
      logger.info('invalid amount', expanded);
      toast('Amount is not valid.');
      return;
    }
    await transferToken({ args: [chromaticAccountAddress, expanded] });

    await fetchChromaticBalances();
  }, [amount, walletAddress, chromaticAccountAddress]);

  const onWithdraw = useCallback(async () => {
    if (!isValid(chromaticAccountAddress)) {
      logger.info('contract is not ready');
      toast('Create your account.');
      return;
    }
    if (!isValid(client)) {
      toast('Connect your wallet first.');
      return;
    }
    if (!isValid(token)) {
      logger.info('token are not selected');
      toast('Settlement token are not selected.');
      return;
    }
    if (isNil(walletAddress)) return;
    const trimmedAmount = Math.floor(Number(amount) * 100);
    const expanded = BigInt(trimmedAmount) * expandDecimals(token.decimals - 2);
    if (!isValid(expanded)) {
      logger.info('invalid amount', expanded);
      toast('Amount is not valid.');
      return;
    }
    const result = await accountApi
      ?.contracts()
      .account(chromaticAccountAddress)
      .simulate.withdraw([token.address, expanded], { account: walletClient?.account });
    if (!result) return;
    const hash = await walletClient?.writeContract(result.request);

    await fetchChromaticBalances();
  }, [chromaticAccountAddress, token, amount, client]);

  const onAmountChange = useCallback((nextValue: string) => {
    nextValue = nextValue.replace(/,/g, '');
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
