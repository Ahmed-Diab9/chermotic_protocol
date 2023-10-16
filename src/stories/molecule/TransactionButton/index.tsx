import { Button, ButtonProps } from '~/stories/atom/Button';
import { useTransactionButton } from './hooks';

export interface TransactionButtonProps extends ButtonProps {}

export const TransactionButton = (props: TransactionButtonProps) => {
  const buttonProps = useTransactionButton(props);
  const { className, size, css } = props;

  return <Button css={css} className={className} size={size} {...buttonProps} />;
};
