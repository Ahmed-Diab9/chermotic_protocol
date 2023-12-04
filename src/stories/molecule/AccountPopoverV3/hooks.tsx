import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMargins } from '~/hooks/useMargins';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { ACCOUNT_STATUS } from '~/typings/account';
import { TRADE_INPUT_EVENT } from '~/typings/events';
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;

  const balance =
    isNotNil(totalMargin) && isNotNil(currentToken)
      ? formatDecimals(totalMargin, currentToken.decimals, 5, true, 'trunc')
      : '-';

  const onClickConnect = () => connectAsync({ connector: connectors[0] });

  const onTradeInput = useCallback(
    (event: CustomEvent<{ isFocused: boolean }>) => {
      if (!isAccountExist && event.detail.isFocused) {
        setIsGuideOpen(true);
        return;
      }
      setIsGuideOpen(false);
    },
    [isAccountExist]
  );

  useEffect(() => {
    window.addEventListener(TRADE_INPUT_EVENT, onTradeInput);
    return () => {
      window.removeEventListener(TRADE_INPUT_EVENT, onTradeInput);
    };
  }, [onTradeInput]);

  return {
    isConnected,
    isAccountExist,
    isLoading,
    isGuideOpen,
    balance,
    tokenName,
    tokenImage,
    onClickConnect,
  };
}
