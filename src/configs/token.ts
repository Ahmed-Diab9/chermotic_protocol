import { Address } from 'wagmi';
import { CHAIN } from '../constants/contracts';

export const USDC =
  CHAIN === 'arbitrum_one'
    ? '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
    : '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892';
export const MILLION_UNITS = 6;

const arbitrumFeeds: Record<string, Address | undefined> = {
  ETH: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  WETH: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  USDC: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
  USDT: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
  LINK: '0x86E53CF1B870786351Da77A57575e79CB55812CB',
  DAI: '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB',
};
const arbitrumGoerliFeeds: Record<string, Address | undefined> = {
  ETH: '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08',
  WETH: '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08',
  USDC: '0x1692Bdd32F31b831caAc1b0c9fAF68613682813b',
  USDT: '0x0a023a3423D9b27A0BE48c768CCF2dD7877fEf5E',
  LINK: '0xd28Ba6CA3bB72bF371b80a2a0a33cBcf9073C954',
  DAI: '0x103b53E977DA6E4Fa92f76369c8b7e20E7fb7fe1',
};
export const PRICE_FEEDS: Record<string, Record<string, Address | undefined> | undefined> = {
  arbitrum_one: arbitrumFeeds,
  arbitrum_goerli: arbitrumGoerliFeeds,
  anvil: arbitrumGoerliFeeds,
};

export const CHRM = 'CHRM';
