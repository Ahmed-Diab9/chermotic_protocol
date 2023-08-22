import { Button, ButtonProps } from '~/stories/atom/Button';
import { useTransactionButton } from './hooks';

export interface TransactionButtonProps extends ButtonProps {}

export const TransactionButton = (props: TransactionButtonProps) => {
  const buttonProps = useTransactionButton(props);
  const { className, size } = props;

  return <Button css={'active'} className={className} size={size} {...buttonProps} />;
};
