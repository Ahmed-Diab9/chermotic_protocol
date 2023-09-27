import { AccountPanelV3Props } from '../';

interface useAccountPanelV3Props extends AccountPanelV3Props {}

export const useAccountPanelV3 = ({ type }: useAccountPanelV3Props) => {
  const isDeposit = type === 'Deposit';

  return {
    isLoading: false,

    isDeposit,

    isAccountNotExist: false,
    isAccountCreating: false,
    isAccountCreated: false,
    isAccountExist: true,

    chromaticAddress: '0x00000000000000',
    addressExplorer: undefined,
    tokenName: 'CHRM',
    availableMargin: '1,000',

    maxAmount: '100',
    minimumAmount: '10',
    isAmountError: false,
    isExceeded: false,
    isLess: false,
    isSubmitDisabled: false,

    amount: undefined,
    onAmountChange: () => {},

    onClickCreateAccount: () => {},
    onClickSubmit: () => {},
  };
};
