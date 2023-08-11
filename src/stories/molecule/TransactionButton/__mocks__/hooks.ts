import { TransactionButtonProps } from '../';

export function useTransactionButton(props: TransactionButtonProps) {
  const disabled = props.disabled;

  const css: TransactionButtonProps['css'] = disabled ? 'gray' : 'active';
  const className = props.className || 'w-full';
  const size = props.size || '2xl';

  return {
    ...props,
    className,
    size,
    disabled,
    css,
  };
}
