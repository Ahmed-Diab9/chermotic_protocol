import { Position } from '~/typings/position';

export const priceClass = (position: Position, type: 'toProfit' | 'toLoss') => {
  if (position.qty > 0n && type === 'toProfit') {
    return `!text-price-higher`;
  }
  if (position.qty > 0n && type === 'toLoss') {
    return `!text-price-lower`;
  }
  if (position.qty <= 0n && type === 'toProfit') {
    return `!text-price-lower`;
  }
  if (position.qty <= 0n && type === 'toLoss') {
    return `!text-price-higher`;
  }
  return '';
};
