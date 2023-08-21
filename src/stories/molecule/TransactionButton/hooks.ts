import { MouseEventHandler, useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';

import { useChain } from '~/hooks/useChain';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';

import { ACCOUNT_STATUS } from '~/typings/account';

import { TransactionButtonProps } from '.';

export function useTransactionButton(props: TransactionButtonProps) {
  const { isDisconnected } = useAccount();
  const { isWrongChain, switchChain } = useChain();
  const { status } = useChromaticAccount();
  const { connectAsync, connectors } = useConnect();
  const { onCreateAccount } = useCreateAccount();

  const isNoAccount = status !== ACCOUNT_STATUS.COMPLETED;

  const disabled = !isWrongChain && !isNoAccount && !isDisconnected && props.disabled;

  const onClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    if (isDisconnected) {
      connectAsync({ connector: connectors[0] });
    } else if (isNoAccount) {
      onCreateAccount();
    } else if (isWrongChain) {
      switchChain();
    } else {
      props.onClick?.(event);
    }
  };

  const label = useMemo(() => {
    if (isDisconnected) {
      return 'Connect Wallet';
    } else if (isNoAccount) {
      return 'Create Account';
    } else if (isWrongChain) {
      return 'Change Network';
    } else {
      return props.label;
    }
  }, [isDisconnected, isNoAccount, isWrongChain]);

  const css: TransactionButtonProps['css'] = disabled ? 'default' : 'active';
  const className = props.className || 'w-full';
  const size = props.size || '2xl';

  return {
    ...props,
    label,
    className,
    size,
    onClick,
    disabled,
    css,
  };
}
