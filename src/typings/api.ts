export type CMCTokenInfo = {
  id: number;
  name: string;
  symbol: string;
  category: string;
  description: string;
  slug: string;
  logo: string;
  subreddit: string;
  notice: string;
  tags: string[];
  'tag-names': string[];
  'tag-groups': string[];
  urls: {
    [type: string]: string[];
  };
  platform: unknown;
  date_added: string;
  twitter_username: string;
  is_hidden: number;
  date_launched: unknown;
  contract_address: {
    contract_address: string;
    platform: {
      name: string;
      coin: {
        id: string;
        name: string;
        symbol: string;
        slug: string;
      };
    };
  }[];
  self_reported_circulating_supply: unknown;
  self_reported_tags: unknown;
  self_reported_market_cap: unknown;
  infinite_supply: boolean;
};
