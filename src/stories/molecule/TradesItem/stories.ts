import type { Meta, StoryObj } from '@storybook/react';
import { TradesItem } from '.';

const meta = {
  title: 'Molecule/TradesItem',
  component: TradesItem,
} satisfies Meta<typeof TradesItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    position: {
      id: 2n,
      tokenAddress: '0x0000000000000000',
      openVersion: 3n,
      closeVersion: 0n,
      qty: -100000000n,
      openTimestamp: 1691689413n,
      closeTimestamp: 0n,
      takerMargin: 10000000n,
      owner: '0x00',
      _binMargins: [
        {
          tradingFeeRate: 3,
          amount: 100000000n,
        },
      ],
      _feeProtocol: 0,
      makerMargin: 100000000n,
      openPrice: 102000000000000000000n,
      closePrice: undefined,
      marketAddress: '0x00',
      lossPrice: 112200000000000000000n,
      profitPrice: 0n,
      pnl: 980392n,
      collateral: 10000000n,
      status: 1,
      toLoss: 110891089108910891n,
      toProfit: -1000000000000000000n,
    },
  },
};
