import { useState } from 'react';

export function useClosePositonModal() {
  const [isOpen, setIsOpen] = useState(true);
  return {
    isOpen,
    onClose: () => {
      setIsOpen(false);
    },

    position: {
      qty: '15,000.00 cETH',
      collateral: '1,500.00 cETH',
      leverage: '10.00x',
      direction: 'long',
      tokenName: 'cETH',
      marketDescription: 'ETH/USD',
      marketImage: '',
      entryPrice: '$ 2,200.00',
      pnl: '+2.00 cETH',
      pnlPercentage: '+20.00%',
      pnlClass: 'text-price-higher',
    },
  };
}
