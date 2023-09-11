import { Button } from '~/stories/atom/Button';
import { Loading } from '~/stories/atom/Loading';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { Position } from '~/typings/position';

import { usePositionItemV2 } from './hooks';

export interface PositionItemV2Props {
  position: Position;
}

export function PositionItemV2(props: PositionItemV2Props) {
  const {
    qty,
    collateral,
    leverage,
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
  } = usePositionItemV2(props);

  return (
    <div className="tr">
      <div className="td">
        <div>
          <div className="text-sm text-primary-light">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryTime}
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
      {isOpening && (
        <div className="gap-2 border-r td">
          <Loading size="sm" />
          <div className="flex text-sm text-primary">
            Waiting for the next oracle round
            <TooltipGuide iconOnly label="opening-in-progress" />
          </div>
        </div>
      )}
      {isClosing && (
        <div className="gap-2 border-r td">
          <Loading size="sm" />
          <div className="flex text-sm text-primary">
            Closing in progress
            <TooltipGuide iconOnly label="closing-in-progress" />
          </div>
        </div>
      )}
      {(isOpened || isClosed) && (
        <>
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
              <Tag label={leverage} className="tag-leverage" />
            </SkeletonElement>
          </div>
          <div className="td">
            {/* TP */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {profitPrice}
              </SkeletonElement>
              <div className={`mt-[2px] ${tpPriceClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {takeProfit}
                </SkeletonElement>
              </div>
            </div>
          </div>
          <div className="td">
            {/* SL */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {lossPrice}
              </SkeletonElement>
              <div className={`mt-[2px] ${slPriceClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {stopLoss}
                </SkeletonElement>
              </div>
            </div>
          </div>
          <div className="td">
            {/* PnL */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {pnlAmount}
              </SkeletonElement>
              <div className={`mt-[2px] ${pnlClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {pnlPercentage}
                </SkeletonElement>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="td">
        <div>
          <div>
            {(isOpened || isOpening) && (
              <Button label="Close" css="underlined" size="sm" onClick={onClosePosition} />
            )}
            {isClosed && (
              <Button label="Claim" css="underlined" size="sm" onClick={onClaimPosition} />
            )}
            {isClosing && <Button label="Claim" css="underlined" size="sm" disabled={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
