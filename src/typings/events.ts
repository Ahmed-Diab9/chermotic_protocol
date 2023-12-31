export const TRADE_EVENT = 'trade';
export const POOL_EVENT = 'pool';
export const LP_EVENT = 'lp';
export const LP_RECEIPT_EVENT = 'lp-receipts';
export const REWARD_EVENT = 'reward';
export const TRADE_INPUT_EVENT = 'trade-input';

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
export const dispatchLpReceiptEvent = () => {
  window.dispatchEvent(
    new CustomEvent(LP_RECEIPT_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
};
export const dispatchSyncEvent = () => {
  window.dispatchEvent(
    new CustomEvent(REWARD_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
};
export const dispatchRewardEvent = () => {
  window.dispatchEvent(
    new CustomEvent(REWARD_EVENT, {
      bubbles: true,
      cancelable: true,
    })
  );
};
export const dispatchAmountInputEvent = (isFocused: boolean) => {
  window.dispatchEvent(
    new CustomEvent(TRADE_INPUT_EVENT, {
      bubbles: true,
      cancelable: true,
      detail: {
        isFocused,
      },
    })
  );
};
declare global {
  interface CustomEventMap {
    [TRADE_EVENT]: CustomEvent<unknown>;
    [POOL_EVENT]: CustomEvent<unknown>;
    [LP_EVENT]: CustomEvent<unknown>;
    [LP_RECEIPT_EVENT]: CustomEvent<unknown>;
    [REWARD_EVENT]: CustomEvent<unknown>;
    [TRADE_INPUT_EVENT]: CustomEvent<{ isFocused: boolean }>;
  }
  interface Window {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, event: CustomEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Window, event: CustomEventMap[K]) => void
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(event: CustomEventMap[K]): void;
  }
}
