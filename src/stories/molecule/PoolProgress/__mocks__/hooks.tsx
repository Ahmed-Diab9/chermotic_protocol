import { useRef } from 'react';

export const usePoolProgress = () => {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const lastOracle = {
    hours: '1',
    minutes: '2',
    seconds: '3',
  };

  const mintingReceipt = {
    key: 'minting-1',
    status: 'standby',
    detail: 'Waiting for the next oracle round',
    name: 'ETH/USD -0.01%',
    remainedCLBAmount: '50.00',
    tokenName: 'CHRM',
    progressPercent: 0,
    action: 'add',
    isLoading: false,
    isStandby: true,
    isInprogress: false,
    isCompleted: false,
    isAdd: true,
    isRemove: false,
  };

  const burningReceipt = {
    key: 'burning-1',
    status: 'standby',
    detail: 'Waiting for the next oracle round',
    name: 'ETH/USD -0.01%',
    remainedCLBAmount: '549.76',
    tokenName: 'CHRM',
    progressPercent: 0,
    action: 'remove',
    isLoading: false,
    isStandby: true,
    isInprogress: false,
    isCompleted: false,
    isAdd: false,
    isRemove: true,
  };

  return {
    openButtonRef,
    ref,
    isGuideOpen: true,

    lastOracle,

    poolReceipts: [mintingReceipt, burningReceipt],
    poolReceiptsCount: 2,
    isReceiptsEmpty: false,
    isClaimDisabled: false,
    onAllClaimClicked: () => {},

    mintingReceipts: [mintingReceipt],
    mintingsCount: 1,
    isMintingsEmpty: false,
    isMintingClaimDisabled: false,
    onAddClaimClicked: () => {},

    burningReceipts: [burningReceipt],
    burningsCount: 1,
    isBurningsEmpty: false,
    isBurningClaimDisabled: false,
    onRemoveClaimClicked: () => {},
  };
};
