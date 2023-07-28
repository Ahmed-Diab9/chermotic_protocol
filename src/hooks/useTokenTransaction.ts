import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { isNil } from 'ramda';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount, useContractWrite, useWalletClient } from 'wagmi';
import { Logger } from '../utils/log';
import { isValid } from '../utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useChromaticAccount } from './useChromaticAccount';
import { useSettlementToken } from './useSettlementToken';

const logger = Logger('useTokenTransaction');

const useTokenTransaction = () => {
  const { address: walletAddress } = useAccount();
  const { accountAddress: chromaticAccountAddress, fetchBalances: fetchChromaticBalances } =
    useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { client } = useChromaticClient();
  const [amount, setAmount] = useState('');
  const { data: walletClient } = useWalletClient();
  const { writeAsync: transferToken } = useContractWrite({
    abi: ierc20ABI,
    address: currentToken?.address,
    functionName: 'transfer',
  });

  const onDeposit = useCallback(
    async (onAfterDeposit?: () => unknown) => {
      try {
        logger.info('onDeposit called');
        if (!isValid(walletAddress) || !isValid(chromaticAccountAddress)) {
          logger.info('no addresses selected');
          toast('Addresses are not selected.');
          return;
        }
        if (!isValid(currentToken)) {
          logger.info('token are not selected');
          toast('Settlement token is not selected.');
          return;
        }
        const expanded = parseUnits(amount, currentToken.decimals);
        if (!isValid(expanded)) {
          logger.info('invalid amount', expanded);
          toast('Amount is not valid.');
          return;
        }

        setAmount('');
        const { hash } = await transferToken?.({
          args: [chromaticAccountAddress, parseUnits(amount, currentToken.decimals)],
        });
        onAfterDeposit?.();

        await client?.publicClient?.waitForTransactionReceipt({ hash });
        await fetchChromaticBalances();

        toast(`${amount} ${currentToken.name} has been deposited.`);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(String(error));
        }
      }
    },
    [amount, walletAddress, chromaticAccountAddress]
  );

  const onWithdraw = useCallback(
    async (onAfterWithdraw?: () => unknown) => {
      try {
        if (!isValid(chromaticAccountAddress)) {
          logger.info('contract is not ready');
          toast('Create your account.');
          return;
        }
        if (!isValid(client)) {
          toast('Connect your wallet first.');
          return;
        }
        if (!isValid(currentToken)) {
          logger.info('token are not selected');
          toast('Settlement token are not selected.');
          return;
        }
        if (isNil(walletAddress)) return;
        const expanded = parseUnits(amount, currentToken.decimals);
        if (!isValid(expanded)) {
          logger.info('invalid amount', expanded);
          toast('Amount is not valid.');
          return;
        }

        setAmount('');
        const accountApi = client.account();
        const result = await accountApi
          ?.contracts()
          .account(chromaticAccountAddress)
          .simulate.withdraw([currentToken.address, expanded], { account: walletClient?.account });
        if (!result) return;

        const hash = await walletClient?.writeContract(result.request);
        if (isNil(hash)) {
          throw new Error('withdrawal failed');
        }
        onAfterWithdraw?.();
        await client?.publicClient?.waitForTransactionReceipt({ hash });
        await fetchChromaticBalances();
        toast(`${amount} ${currentToken.name} has been withdrawn.`);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(String(error));
        }
      }
    },
    [chromaticAccountAddress, currentToken, amount, client]
  );

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
