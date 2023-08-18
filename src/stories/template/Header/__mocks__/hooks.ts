export function useHeader() {
  return {
    isActiveLink: () => false,

    isConnected: true,
    isWrongChain: false,
    isDisconnected: false,

    walletAddress: '0x00000...00000',

    onConnect: () => {},
    onSwitchChain: () => {},
  };
}
