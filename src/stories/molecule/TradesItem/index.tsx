import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';

import { TradeEntryOnly } from '~/typings/position';

export interface TradesItemProps {
  trade?: TradeEntryOnly;
  isLoading: boolean;
  onLoadRef?: (element: HTMLDivElement | null) => unknown;
}

export function TradesItem(props: TradesItemProps) {
  const {
    trade: { token, market, direction, entryPrice, entryTime, collateral, qty, leverage } = {},
    isLoading,
    onLoadRef,
  } = props;

  return (
    <div className="text-left tr" ref={(element) => onLoadRef?.(element)}>
      <div className="td">
        <div>
          <div className="flex text-sm text-primary-light">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryTime}{' '}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h5>{token && token.name}</h5>
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h5>{market && market.description}</h5>
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
          <Tag label={leverage} className="tag-leverage" />
        </SkeletonElement>
      </div>
    </div>
  );
}
