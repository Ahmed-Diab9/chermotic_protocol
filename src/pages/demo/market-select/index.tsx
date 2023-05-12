import { useEffect, useMemo, useState } from "react";
import { BigNumber } from "ethers";
import { Market, Token } from "../../../typings/market";
import { isValid } from "../../../utils/valid";
import { errorLog } from "../../../utils/log";
import { MarketSelect } from "../../../stories/molecule/MarketSelect";

const mockTokens: Token[] = [
  {
    address: "0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892",
    name: "USDC",
    balance: BigNumber.from(100),
  },
  {
    address: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
    name: "USDT",
    balance: BigNumber.from(100),
  },
];
const mockMarkets: Record<string, Market[]> = {
  USDC: [
    {
      address: "0x0000000000000000000",
      description: "ETH/USD",
      price: BigNumber.from(1500),
    },
    {
      address: "0x4445556667778889999",
      description: "AAVE/USD",
      price: BigNumber.from(500),
    },
    {
      address: "0x1111111111111111111",
      description: "GALA/USD",
      price: BigNumber.from(200),
    },
  ],
  USDT: [
    {
      address: "0x9999999999999999999",
      description: "ETH/USD",
      price: BigNumber.from(200),
    },
    {
      address: "0x8888888888888888888",
      description: "ARB/USD",
      price: BigNumber.from(100),
    },
  ],
};

const MarketSelectDemo = () => {
  const tokens = mockTokens;
  const [token, setToken] = useState<Token>();
  const markets = useMemo(() => {
    if (!isValid(token)) {
      return [];
    }
    const nextMarket = mockMarkets[token.name];
    if (!isValid(nextMarket)) {
      return [];
    }
    return nextMarket;
  }, [token]);
  const [market, setMarket] = useState<Market>();

  useEffect(() => {
    if (!isValid(token)) {
      setToken(tokens[0]);
    }
    if (!isValid(market)) {
      setMarket(markets[0]);
    }
  }, [token, tokens, market, markets]);

  const onTokenClick = (address: string) => {
    if (token?.address === address) {
      return;
    }
    const nextToken = tokens.find((token) => token.address === address);
    if (!isValid(nextToken)) {
      errorLog("no settlement tokens selected");
      return;
    }
    const nextMarket = mockMarkets[nextToken.name][0];
    if (!isValid(nextMarket)) {
      errorLog("the selected markets are invalid");
      return;
    }
    setToken(nextToken);
    setMarket(nextMarket);
  };

  const onMarketClick = (address: string) => {
    setMarket(markets.find((market) => market.address === address)!);
  };

  return (
    <MarketSelect
      tokens={tokens}
      markets={markets}
      selectedToken={token}
      selectedMarket={market}
      onMarketClick={onMarketClick}
      onTokenClick={onTokenClick}
    />
  );
};

export default MarketSelectDemo;
