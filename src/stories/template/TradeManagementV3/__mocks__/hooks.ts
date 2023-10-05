import { useEffect, useRef } from 'react';
import { POSITION_STATUS } from '~/typings/position';

export function useTradeManagementV3() {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isGuideVisible = true;

  const isLoading = false;

  const lastOracle = {
    hours: '1',
    minutes: '2',
    seconds: '3',
  };

  useEffect(() => {
    openButtonRef.current?.click();
  }, [openButtonRef.current]);

  const currentPrice = '1,000';

  const isPositionsEmpty = false;

  const dummyPosition = {
    marketAddress: '0x00',
    tokenAddress: '0x00',
    lossPrice: 10n,
    profitPrice: 10n,
    toProfit: 10n,
    collateral: 10n,
    toLoss: 10n,
    pnl: 10n,
    openVersion: 10n,
    closeVersion: 10n,
    qty: 10n,
    openTimestamp: 10n,
    closeTimestamp: 10n,
    takerMargin: 10n,
    owner: '',
    _binMargins: [],
    _feeProtocol: 2,
    makerMargin: 10n,
    closePrice: 10n,
    openPrice: 10n,
  };

  const positionList = [
    {
      ...dummyPosition,
      status: POSITION_STATUS.OPENING,
      id: 0n,
    },
    {
      ...dummyPosition,
      status: POSITION_STATUS.OPENED,
      id: 1n,
    },
    {
      ...dummyPosition,
      status: POSITION_STATUS.CLOSING,
      id: 2n,
    },
    {
      ...dummyPosition,
      status: POSITION_STATUS.CLOSED,
      id: 3n,
    },
  ];

  return {
    openButtonRef,
    popoverRef,
    isGuideVisible,

    lastOracle,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,
  };
}
