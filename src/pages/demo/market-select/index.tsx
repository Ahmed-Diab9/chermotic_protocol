import { useEffect, useMemo, useState } from "react";
import { Market, Token } from "../../../typings/market";
import { isValid } from "../../../utils/valid";
import { errorLog } from "../../../utils/log";
import { MarketSelect } from "../../../stories/molecule/MarketSelect";
import { marketsMock, tokensMock } from "../../../mock";
import { useConnect } from "wagmi";
import useFeeRate from "../../../hooks/useFeeRate";

const MarketSelectDemo = () => {
  const { connectAsync, connectors } = useConnect();
  useEffect(() => {
    connectAsync({
      connector: connectors.find((connector) => connector.id === "metaMask"),
    });
  }, [connectors, connectAsync]);

  const tokens = tokensMock;
  const [token, setToken] = useState<Token>();
  const feeRate = useFeeRate();
  const markets = useMemo(() => {
    if (!isValid(token)) {
      return [];
    }
    const nextMarket = marketsMock[token.name];
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

  useEffect(() => {
    const newMarket = markets[0];

    setMarket(newMarket);
  }, [markets]);

  const onTokenClick = (address: string) => {
    if (token?.address === address) {
      return;
    }
    const nextToken = tokens.find((token) => token.address === address);
    if (!isValid(nextToken)) {
      errorLog("no settlement tokens selected");
      return;
    }
    setToken(nextToken);
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
