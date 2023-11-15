export const DEFAULT_CREDIT_POINT = 10;

export const AIRDROP_LINKS = {
  AIRDROP_INTRO: 'https://chromatic.gitbook.io/docs/community-and-programs/airdrop',
  HOW_TO_CONNECT:
    'https://chromatic.gitbook.io/docs/community-and-programs/airdrop/how-to-connect-zealy-account-to-arbitrum-wallet',
  LINKED_ACCOUNT: 'https://zealy.io/cw/_/settings/linked-accounts',
  GET_CREDITS:
    'https://chromatic.gitbook.io/docs/community-and-programs/airdrop/how-to-get-credits-and-boosters',
  GET_BOOSTERS:
    'https://chromatic.gitbook.io/docs/community-and-programs/airdrop/how-to-get-credits-and-boosters#2.-how-to-get-boosters',
} as const;
export type AirdropLink = typeof AIRDROP_LINKS;
