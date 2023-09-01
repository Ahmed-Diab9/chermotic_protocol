import { isNotNil, isNil } from 'ramda';
import { useAccount, useConnect } from 'wagmi';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useMargins } from '~/hooks/useMargins';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { formatDecimals } from '~/utils/number';
import { ACCOUNT_STATUS } from '~/typings/account';

export function useAccountPopover() {
  const { isConnected } = useAccount();
  const { isChromaticBalanceLoading } = useChromaticAccount();
  const { isTokenBalanceLoading } = useTokenBalances();
  const { totalBalance } = useMargins();
  const { currentToken } = useSettlementToken();
  const { connectAsync, connectors } = useConnect();
  const { status } = useChromaticAccount();

  const isLoading = isTokenBalanceLoading || isChromaticBalanceLoading || isNil(currentToken);

  const isAccountExist = status === ACCOUNT_STATUS.COMPLETED;

  const tokenName = currentToken?.name || '-';

  const balance =
    isNotNil(totalBalance) && isNotNil(currentToken)
      ? formatDecimals(totalBalance, currentToken.decimals, 2, true)
      : '-';

  const onClickConnect = () => connectAsync({ connector: connectors[0] });

  return {
    isConnected,
    isAccountExist,
    isLoading,
    balance,
    tokenName,
    onClickConnect,
  };
}
