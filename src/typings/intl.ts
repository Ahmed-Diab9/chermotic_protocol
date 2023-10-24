export {};

declare global {
  namespace Intl {
    type RoundingMode =
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
    interface NumberFormatOptions {
      roundingMode?: RoundingMode;
    }
  }
}
