export function useRemoveSingleLiquidityModal() {
  return {
    isOpen: true,
    onClose: () => {},

    tokenName: 'CHRM',
    liquidityValue: '10000',
    removableLiquidity: '600',
    removableRate: '60',

    inputClb: 0,
    inputClbValue: '1,000',
    onAmountChange: () => {},
    maxInput: 100000,
    isExceeded: false,

    onClickAll: () => {},
    onClickRemovable: () => {},

    onClickSubmit: () => {},
  };
}
