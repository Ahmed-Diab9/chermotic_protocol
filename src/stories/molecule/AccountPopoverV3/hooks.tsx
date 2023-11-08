import { isNil, isNotNil } from 'ramda';
import { useAccount, useConnect } from 'wagmi';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMargins } from '~/hooks/useMargins';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { ACCOUNT_STATUS } from '~/typings/account';
import { formatDecimals } from '~/utils/number';

export function useAccountPopoverV3() {
  const { isConnected } = useAccount();
  const { isChromaticBalanceLoading } = useChromaticAccount();
  const { isTokenBalanceLoading } = useTokenBalances();
  const { totalMargin } = useMargins();
  const { currentToken } = useSettlementToken();
  const { connectAsync, connectors } = useConnect();
  const { status } = useChromaticAccount();

  const isLoading = isTokenBalanceLoading || isChromaticBalanceLoading || isNil(currentToken);

  const isAccountExist = status === ACCOUNT_STATUS.COMPLETED;

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;

  const balance =
    isNotNil(totalMargin) && isNotNil(currentToken)
      ? formatDecimals(totalMargin, currentToken.decimals, 5, true, 'trunc')
      : '-';

  const onClickConnect = () => connectAsync({ connector: connectors[0] });

  return {
    isConnected,
    isAccountExist,
    isLoading,
    balance,
    tokenName,
    tokenImage,
    onClickConnect,
  };
}
