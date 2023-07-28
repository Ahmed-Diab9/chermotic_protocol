export type Account = {
  walletAddress?: string;
  usumAddress?: string;
};

export const enum ACCOUNT_STATUS {
  'NONE',
  'CREATING',
  'COMPLETING',
  'COMPLETED',
}
