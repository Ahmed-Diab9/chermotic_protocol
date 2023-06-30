export type CLBTokenValue = { key: number; value: number };

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
    },
  ];
};
