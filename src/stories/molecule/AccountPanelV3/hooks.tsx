import { isEmpty, isNil, isNotNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';
import { useMargins } from '~/hooks/useMargins';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import useTokenTransaction from '~/hooks/useTokenTransaction';

import { useAppDispatch } from '~/store';
import { accountAction } from '~/store/reducer/account';

import { ACCOUNT_STATUS } from '~/typings/account';

import { formatDecimals, isNotZero, numberFormat } from '~/utils/number';

import { AccountPanelV3Props } from '.';

interface UseAccountPanelV3Props extends AccountPanelV3Props {}

export const useAccountPanelV3 = ({ type }: UseAccountPanelV3Props) => {
  const {
    accountAddress: chromaticAddress,
    status,
    balances: chromaticBalances,
    isAccountAddressLoading,
  } = useChromaticAccount();
  const { onCreateAccount: onClickCreateAccount } = useCreateAccount();
  const { tokenBalances: walletBalances } = useTokenBalances();
  const { amount, onAmountChange, onDeposit, onWithdraw } = useTokenTransaction();
  const { totalMargin } = useMargins();
  const { totalBalance } = useMargins();
  const { currentToken, isTokenLoading } = useSettlementToken();

  const publicClient = usePublicClient();

  const dispatch = useAppDispatch();

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined;
    if (status === ACCOUNT_STATUS.COMPLETING) {
      timerId = setTimeout(() => {
        dispatch(accountAction.setAccountStatus(ACCOUNT_STATUS.COMPLETED));
      }, 3000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  const addressExplorer = useMemo(() => {
    try {
      const rawUrl = publicClient.chain.blockExplorers?.default?.url;
      if (isNil(rawUrl)) return;
      const origin = new URL(rawUrl).origin;
      if (isNil(origin) || isNil(chromaticAddress)) return;
      return `${origin}/address/${chromaticAddress}`;
    } catch (error) {
      return;
    }
  }, [publicClient, chromaticAddress]);

  const isLoading = isTokenLoading || isAccountAddressLoading;

  const isDeposit = type === 'Deposit';

  const isAccountNotExist = status === ACCOUNT_STATUS.NONE;
  const isAccountCreating = status === ACCOUNT_STATUS.CREATING;
  const isAccountCreated = status === ACCOUNT_STATUS.COMPLETING;
  const isAccountExist = status === ACCOUNT_STATUS.COMPLETED;

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;

  const balance =
    isNotNil(totalBalance) && isNotNil(currentToken)
      ? formatDecimals(totalBalance, currentToken.decimals, 2, true)
      : '-';

  const availableMargin = numberFormat(formatUnits(totalMargin, currentToken?.decimals || 0), {
    maxDigits: 5,
    useGrouping: true,
    roundingMode: 'floor',
  });

  const maxAmount =
    currentToken &&
    (isDeposit
      ? formatUnits(walletBalances?.[currentToken.address] ?? 0n, currentToken?.decimals)
      : formatUnits(chromaticBalances?.[currentToken.address] ?? 0n, currentToken?.decimals));
  const minimumAmount = formatDecimals(currentToken?.minimumMargin, currentToken?.decimals);

  const isExceeded = useMemo(() => {
    if (+amount === 0) return false;
    if (isNil(walletBalances) || isNil(chromaticBalances) || isNil(amount) || isNil(currentToken))
      return false;

    return isDeposit
      ? parseUnits(amount, currentToken.decimals) > walletBalances[currentToken.address]
      : parseUnits(amount, currentToken.decimals) > chromaticBalances[currentToken.address];
  }, [amount, type, currentToken, chromaticBalances, walletBalances]);
  const isLess = useMemo(() => {
    return +amount < +minimumAmount && isNotZero(amount);
  }, [amount]);
  const isAmountError = isExceeded || isLess;
  const isSubmitDisabled = isAmountError || isEmpty(amount) || +amount === 0;

  const onClickSubmit = (onPopoverClose?: () => unknown) => {
    if (isDeposit) {
      onDeposit && onDeposit(onPopoverClose);
    } else {
      onWithdraw && onWithdraw(onPopoverClose);
    }
  };
  return {
    isLoading,

    isDeposit,

    isAccountNotExist,
    isAccountCreating,
    isAccountCreated,
    isAccountExist,

    chromaticAddress,
    addressExplorer,
    tokenName,
    tokenImage,
    availableMargin,
    balance,

    maxAmount,
    minimumAmount,
    isAmountError,
    isSubmitDisabled,
    isExceeded,
    isLess,

    amount,
    onAmountChange,

    onClickCreateAccount,
    onClickSubmit,
  };
};
