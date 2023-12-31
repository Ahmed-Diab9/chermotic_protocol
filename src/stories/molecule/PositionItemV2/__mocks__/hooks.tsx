import { POSITION_STATUS, Position } from '~/typings/position';

import { PositionItemV2Props } from '..';

interface UsePositionItemV2 extends PositionItemV2Props {}

export function usePositionItemV2({ position }: UsePositionItemV2) {
  const isOpening = position.status === POSITION_STATUS.OPENING;
  const isOpened = position.status === POSITION_STATUS.OPENED;
  const isClosing = position.status === POSITION_STATUS.CLOSING;
  const isClosed = position.status === POSITION_STATUS.CLOSED;

  return {
    qty: '1,000.00',
    collateral: '100.00',
    stopLoss: '-10.00%',
    takeProfit: '100.00%',
    profitPriceTo: '(-100.00%)',
    lossPriceTo: '(+11.09%)',
    pnlPercentage: '+9.80%',
    lossPrice: '112.20',
    profitPrice: '0.00',
    entryPrice: '$ 102.00',
    entryTime: 'August 9, 2023',
    pnlAmount: '9.80 USDC',
    direction: 'Short',
    isLoading: false,
    tokenName: 'USDC',
    marketDescription: 'ETH/USD',
    onClosePosition: () => {},
    onClaimPosition: () => {},

    isOpening,
    isOpened,
    isClosing,
    isClosed,

    position: undefined as Position | undefined,
  };
}
