import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';

import { Position } from '~/typings/position';

import { useTradesItem } from './hooks';

export interface TradesItemProps {
  position: Position;
}

export function TradesItem(props: TradesItemProps) {
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
  } = useTradesItem(props);

  return (
    <div className="tr">
      <div className="td">
        <div>
          <div className="flex text-sm text-primary-light">
            <SkeletonElement isLoading={isLoading} width={60}>
              {entryTime}{' '}
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
        <SkeletonElement isLoading={isLoading} width={60}>
          {entryPrice}
        </SkeletonElement>
      </div>
      <div className="td">
        {/* Contract Qty */}
        <SkeletonElement isLoading={isLoading} width={60}>
          {qty}
        </SkeletonElement>
      </div>
      <div className="td">
        {/* Leverage */}
        <SkeletonElement isLoading={isLoading} width={60}>
          <Tag label="4.50x" className="tag-leverage" />
        </SkeletonElement>
      </div>
    </div>
  );
}
