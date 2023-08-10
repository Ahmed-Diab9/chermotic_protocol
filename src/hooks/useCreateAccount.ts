import { isNil } from 'ramda';
import { toast } from 'react-toastify';
import { useAppDispatch } from '~/store';
import { accountAction } from '~/store/reducer/account';
import { ACCOUNT_STATUS } from '~/typings/account';
import { AppError } from '~/typings/error';
import { Logger } from '~/utils/log';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';

const logger = Logger('useCreateAccount');

export const useCreateAccount = () => {
  const { client, walletAddress } = useChromaticClient();
  const { fetchAddress } = useChromaticAccount();
  const dispatch = useAppDispatch();
  const { setAccountStatus } = accountAction;

  const onCreateAccount = async () => {
    if (isNil(walletAddress)) {
      return AppError.reject('no address', 'onCreateAccount');
    }
    try {
      const accountApi = client.account();
      logger.info('Creating accounts');
      dispatch(setAccountStatus(ACCOUNT_STATUS.CREATING));
      await accountApi.createAccount();

      const newAccount = await accountApi.getAccount();
      await fetchAddress(newAccount);

      dispatch(setAccountStatus(ACCOUNT_STATUS.COMPLETING));
    } catch (error) {
      dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
      logger.error(error);

      return AppError.reject(error, 'onCreateAccount');
    }
  };

  const onCreateAccountWithToast = async () => {
    if (isNil(client.walletClient)) {
      return AppError.reject('no address', 'onCreateAccountWithToast');
    }
    try {
      logger.info('Creating accounts');
      dispatch(setAccountStatus(ACCOUNT_STATUS.CREATING));
      const { request } = await client
        .router()
        .contracts()
        .router()
        .simulate.createAccount({ account: client.walletClient.account });
      const hash = await client.walletClient.writeContract(request);
      toast(
        'The account address is being generated on the chain. This process may take approximately 10 seconds or more.'
      );

      await client.publicClient?.waitForTransactionReceipt({ hash });
      const newAccount = await client.account().getAccount();
      await fetchAddress(newAccount);
      dispatch(setAccountStatus(ACCOUNT_STATUS.COMPLETING));
    } catch (error) {
      dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
      logger.error(error);

      return AppError.reject(error, 'onCreateAccountWithToast');
    }
  };

  return { onCreateAccount, onCreateAccountWithToast };
};
