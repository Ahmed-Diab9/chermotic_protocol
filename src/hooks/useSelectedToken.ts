import { useAppSelector } from "../store";

const useSelectedToken = () => {
  const { markets, selectedToken } = useAppSelector((state) => state.market);

  if (!selectedToken) {
    return [];
  }
  const filteredMarket = markets.filter(
    (market) => market.tokenAddress === selectedToken.address
  );
  return filteredMarket;
};

export default useSelectedToken;
