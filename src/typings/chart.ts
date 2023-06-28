export type CLBTokenValue = { key: number; value: number };

export type Liquidity = {
  key: number;
  value: [
    {
      label: 'available';
      amount: number;
    },
    {
      label: 'utilized';
      amount: number;
    }
  ];
};
