export type Account = {
  walletAddress?: string;
  chromaticAddress?: string;
};

export const enum ACCOUNT_STATUS {
  'NONE',
  'CREATING',
  'COMPLETING',
  'COMPLETED',
}
