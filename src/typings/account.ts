export type Account = {
  walletAddress?: string;
  usumAddress?: string;
};

export const ACCOUNT_NONE = "NONE";
export const ACCOUNT_CREATING = "CREATING";
export const ACCOUNT_COMPLETING = "COMPLETING";
export const ACCOUNT_COMPLETED = "COMPLETED";

export type ACCOUNT_STATUS = "NONE" | "CREATING" | "COMPLETING" | "COMPLETED";
