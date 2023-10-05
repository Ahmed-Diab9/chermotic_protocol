export const TRADE_EVENT = 'trade';
export const POOL_EVENT = 'pool';
export const LP_EVENT = 'lp';

export const dispatchTradeEvent = () =>
  window.dispatchEvent(
    new CustomEvent(TRADE_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
export const dispatchPoolEvent = () =>
  window.dispatchEvent(
    new CustomEvent(POOL_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
export const dispatchLpEvent = () =>
  window.dispatchEvent(
    new CustomEvent(LP_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
