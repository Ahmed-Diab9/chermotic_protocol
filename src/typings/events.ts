export const TRADE_EVENT = 'trade';
export const POOL_EVENT = 'pool';

export const TradeEvent = new CustomEvent(TRADE_EVENT, {
  bubbles: true,
  cancelable: true,
});
export const PoolEvent = new CustomEvent(POOL_EVENT, {
  bubbles: true,
  cancelable: true,
});
