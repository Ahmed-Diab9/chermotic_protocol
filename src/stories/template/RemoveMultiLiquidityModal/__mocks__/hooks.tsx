export function useRemoveMultiLiquidityModal() {
  return {
    isOpen: true,
    onClose: () => {},

    selectedBinsCount: 3,

    tokenName: 'CHRM',
    totalClb: '1,000',
    totalLiquidityValue: '1,000',
    removableLiquidity: '600',
    removableRate: '60',

    removeAmount: '1,000',
    onClickAll: () => {},
    onClickRemovable: () => {},

    onClickSubmit: () => {},
  };
}
