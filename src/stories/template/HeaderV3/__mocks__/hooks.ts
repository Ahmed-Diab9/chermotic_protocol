export function useHeaderV3() {
  const walletPopoverProps = {
    isWrongChain: false,
    isDisconnected: false,
  };

  return {
    isActiveLink: () => false,

    walletPopoverProps,
  };
}
