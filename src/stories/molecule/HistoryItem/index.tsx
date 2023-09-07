import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';

import { Position } from '~/typings/position';

import { useHistoryItem } from './hooks';

export interface HistoryItemProps {
  position: Position;
}

export function HistoryItem(props: HistoryItemProps) {
  const {
    qty,
    collateral,
    stopLoss,
    takeProfit,
    profitPriceTo,
    lossPriceTo,
    pnlPercentage,
    lossPrice,
    profitPrice,
    entryPrice,
    entryTime,
    pnlAmount,

    direction,

    onClosePosition,
    onClaimPosition,

    isLoading,

    isOpening,
    isOpened,
    isClosing,
    isClosed,

    tokenName,
    marketDescription,

    tpPriceClass,
    slPriceClass,
    pnlClass,
  } = useHistoryItem(props);

  return (
    <div className="tr">
      <div className="td">
        <div>
          <div className="flex text-sm text-primary-light">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryTime}{' '}
            </SkeletonElement>
            <SkeletonElement isLoading={isLoading} width={40}>
              {/* todo: close time */}| May 20 17:45:12
              {/* | {closeTime} */}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-2 mt-[2px]">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h6>{tokenName}</h6>
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h6>{marketDescription}</h6>
              </SkeletonElement>
            </div>
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={direction} />
            </SkeletonElement>
          </div>
        </div>
      </div>
      <div className="td">
        <SkeletonElement isLoading={isLoading} width={40}>
          {entryPrice}
        </SkeletonElement>
      </div>
      <div className="td">
        {/* Contract Qty */}
        <SkeletonElement isLoading={isLoading} width={40}>
          {qty}
        </SkeletonElement>
      </div>
      <div className="td">
        {/* Leverage */}
        <SkeletonElement isLoading={isLoading} width={40}>
          <Tag label="4.50x" className="tag-leverage" />
        </SkeletonElement>
      </div>
      <div className="td">
        {/* PnL */}
        <div>
          <SkeletonElement isLoading={isLoading} width={40}>
            {pnlAmount}
          </SkeletonElement>
          <div className={`mt-[2px] ${pnlClass}`}>
            <SkeletonElement isLoading={isLoading} width={40}>
              {/* todo: PnL difference */}
              (-24.34ETH)
            </SkeletonElement>
          </div>
        </div>
      </div>
      <div className="td">
        {/* PnL percent */}
        <SkeletonElement isLoading={isLoading} width={40}>
          {pnlPercentage}
        </SkeletonElement>
      </div>
    </div>
  );
}
