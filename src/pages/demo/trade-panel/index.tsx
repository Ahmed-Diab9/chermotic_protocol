import useConnectOnce from "~/hooks/useConnectOnce";
import { TradePanel } from "~/stories/template/TradePanel";

const TradePanelDemo = () => {
  useConnectOnce();

  return <TradePanel />;
};

export default TradePanelDemo;
