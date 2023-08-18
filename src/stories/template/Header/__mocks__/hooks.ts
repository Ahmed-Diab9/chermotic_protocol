export function useHeader() {
  const walletPopoverProps = {
    isWrongChain: false,
    isDisconnected: false,
  };

  return {
    isActiveLink: () => false,

    walletPopoverProps,
  };
}
