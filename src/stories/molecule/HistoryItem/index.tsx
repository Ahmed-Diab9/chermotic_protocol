import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';

import { TradeHistory } from '~/typings/position';

export interface HistoryItemProps {
  isLoading: boolean;
  history?: TradeHistory;
  onLoadRef?: (element: HTMLDivElement | null) => unknown;
}

export function HistoryItem(props: HistoryItemProps) {
  const {
    history: {
      token,
      market,
      direction,
      entryTime,
      closeTime,
      collateral,
      qty,
      entryPrice,
      leverage,
      pnl,
      pnlRate,
      pnlClass,
    } = {},
    isLoading,
    onLoadRef,
  } = props;

  return (
    <div className="tr" ref={(element) => onLoadRef?.(element)}>
      <div className="td">
        <div>
          <div className="flex text-sm text-primary-light text-ellipsis">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryTime}
            </SkeletonElement>
            {' | '}
            <SkeletonElement isLoading={isLoading} width={40}>
              {closeTime}
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
      <div className="td">
        {/* PnL */}
        <div>
          <SkeletonElement isLoading={isLoading} width={40}>
            <span className={pnlClass}>{pnl}</span>
          </SkeletonElement>
          {/* <div className={`mt-[2px] ${pnlClass}`}>
            <SkeletonElement isLoading={isLoading} width={40}>
              (-24.34ETH)
            </SkeletonElement>
          </div> */}
        </div>
      </div>
      <div className="td">
        {/* PnL percent */}
        <SkeletonElement isLoading={isLoading} width={40}>
          <span className={pnlClass}>{pnlRate}</span>
        </SkeletonElement>
      </div>
    </div>
  );
}
