export type CLBTokenValue = { key: number; value: bigint };

export type Liquidity = {
  key: number;
  value: [
    {
      label: 'utilized';
      amount: number;
    },
    {
      label: 'available';
      amount: number;
    }
  ];
};
