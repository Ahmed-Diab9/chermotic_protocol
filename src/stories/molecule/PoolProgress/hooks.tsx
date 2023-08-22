import { isNil, isNotNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';

import { POOL_EVENT } from '~/typings/events';
import { Token } from '~/typings/market';

import usePoolReceipt, { LpReceipt } from '~/hooks/usePoolReceipt';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { formatDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';

const formatter = Intl.NumberFormat('en', {
  useGrouping: true,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const receiptDetail = (receipt: LpReceipt, token: Token) => {
  const { burningAmount = 0n, amount, status, action, progressPercent } = receipt;
  if (status === 'standby') {
    return 'Waiting for the next oracle round';
  }
  if (action === 'add') {
    return formatDecimals(receipt.amount, token.decimals, 2);
  }

  return `${formatDecimals(burningAmount, token.decimals, 2, true)} / ${formatDecimals(
    amount,
    token.decimals,
    2,
    true
  )} ${token.name} (${formatter.format(progressPercent)}%)`;
};

export const usePoolProgress = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [isGuideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    function onPool() {
      if (isValid(openButtonRef.current) && isNil(ref.current)) {
        setGuideOpen(true);
        openButtonRef.current.click();
      }
    }
    window.addEventListener(POOL_EVENT, onPool);
    return () => {
      window.removeEventListener(POOL_EVENT, onPool);
    };
  }, []);

  const { currentToken } = useSettlementToken();
  const {
    receipts: _receipts,
    isReceiptsLoading: isLoading,
    onClaimCLBTokens,
    onClaimCLBTokensBatch,
  } = usePoolReceipt();

  const receipts = _receipts || [];

  const lastOracle = useLastOracle();

  const tokenName = currentToken?.name || '-';

  const poolReceipts = isNotNil(currentToken)
    ? receipts.map((receipt, index) => {
        const key = `${receipt.id.toString()}-${index}`;
        const status = receipt.status;
        const detail = receiptDetail(receipt, currentToken);
        const name = receipt.name;
        const remainedCLBAmount = formatDecimals(
          receipt.remainedCLBAmount,
          currentToken.decimals,
          2
        );
        const progressPercent = receipt.progressPercent;
        const action = receipt.action;
        const onClick = () => {
          if (isStandby) return;
          onClaimCLBTokens?.(receipt.id, receipt.action);
        };

        const isStandby = status === 'standby';
        const isInprogress = status === 'in progress';
        const isCompleted = status === 'completed';

        const isAdd = action === 'add';
        const isRemove = action === 'remove';

        return {
          key,
          status,
          detail,
          name,
          remainedCLBAmount,
          tokenName,
          progressPercent,
          action,
          onClick,
          isLoading,
          isStandby,
          isInprogress,
          isCompleted,
          isAdd,
          isRemove,
        };
      })
    : [];
  const poolReceiptsCount = poolReceipts.length;
  const isReceiptsEmpty = poolReceiptsCount === 0;

  const mintingReceipts = poolReceipts.filter((receipt) => receipt.action === 'add');
  const burningReceipts = poolReceipts.filter((receipt) => receipt.action === 'remove');
  const mintingsCount = mintingReceipts.length;
  const burningsCount = burningReceipts.length;
  const isMintingsEmpty = mintingsCount === 0;
  const isBurningsEmpty = burningsCount === 0;

  const isClaimDisabled =
    receipts.filter(({ status }) => status !== 'standby').map((receipt) => receipt.id).length === 0;
  const isMintingClaimDisabled =
    mintingReceipts.filter(({ status }) => status !== 'standby').length === 0;
  const isBurningClaimDisabled =
    burningReceipts.filter(({ status }) => status !== 'standby').length === 0;

  const onAllClaimClicked = () => onClaimCLBTokensBatch();
  const onAddClaimClicked = () => onClaimCLBTokensBatch('add');
  const onRemoveClaimClicked = () => onClaimCLBTokensBatch('remove');

  return {
    openButtonRef,
    ref,
    isGuideOpen,

    lastOracle,

    poolReceipts,
    poolReceiptsCount,
    isReceiptsEmpty,
    isClaimDisabled,
    onAllClaimClicked,

    mintingReceipts,
    mintingsCount,
    isMintingsEmpty,
    isMintingClaimDisabled,
    onAddClaimClicked,

    burningReceipts,
    burningsCount,
    isBurningsEmpty,
    isBurningClaimDisabled,
    onRemoveClaimClicked,
  };
};
