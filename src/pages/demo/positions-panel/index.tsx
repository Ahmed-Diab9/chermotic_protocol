import { useEffect } from "react";
import useConnectOnce from "~/hooks/useConnectOnce";
import { usePosition, usePositionsMock } from "~/hooks/usePosition";
import { TradeBar } from "~/stories/template/TradeBar";
import { infoLog } from "~/utils/log";

const PositionsPanelDemo = () => {
  useConnectOnce();
  const [positions, fetchPositions, onClosePosition] = usePosition();
  const [positionsMock] = usePositionsMock();

  useEffect(() => {
    infoLog("positions", positions);
  }, [positions]);

  return <TradeBar />;
};

export default PositionsPanelDemo;
