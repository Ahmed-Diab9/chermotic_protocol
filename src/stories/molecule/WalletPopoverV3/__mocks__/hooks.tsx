export function useWalletPopoverV3() {
  return {
    onConnect: () => {},
    onSwitchChain: () => {},
    onCreateAccount: () => {},
    onDisconnect: () => {},

    isLoading: false,

    chainName: 'Testnet',

    accountExplorerUrl: 'https://google.com/',

    assets: [],
    isAssetEmpty: true,

    liquidityTokens: [],
    isLiquidityTokenEmpty: true,

    walletAddress: '0x00000...00000',
    onCopyWalletAddress: () => {},

    chromaticAddress: '0x11111...11111',
    onCopyChromaticAddress: () => {},
    isChromaticAccountExist: true,
  };
}
