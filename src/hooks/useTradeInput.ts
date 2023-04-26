import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { tradeAction } from "../store/reducer/trade";

const useTradeInput = () => {
  const { type, unit, pools } = useAppSelector((state) => state.trade);
  const dispatch = useAppDispatch();

  const [leverage, setLeverage] = useState("");
  const [collateral, setCollateral] = useState("");
  const [contractQuantity, setContractQuantity] = useState("");
  const [takeProfitRatio, setTakeProfitRatio] = useState("");
  const [stopLossRatio, setStopLossRatio] = useState("");

  const onTypeToggle = (nextType: typeof type) => {
    dispatch(tradeAction.onTypeToggle(nextType));
  };

  const onUnitToggle = (nextUnit: typeof unit) => {
    dispatch(tradeAction.onUnitToggle(nextUnit));
  };

  const onLeverageChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setLeverage("");
      dispatch(tradeAction.onLeverageChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setLeverage(nextValue);
    dispatch(tradeAction.onLeverageChange(parsed));
  };

  const onCollateralChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setCollateral("");
      dispatch(tradeAction.onCollateralChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setCollateral(nextValue);
    dispatch(tradeAction.onCollateralChange(parsed));
  };

  const onContractQuantityChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setContractQuantity("");
      dispatch(tradeAction.onContractQuantityChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setContractQuantity(nextValue);
    dispatch(tradeAction.onContractQuantityChange(parsed));
  };

  const onTakeProfitRatioChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setTakeProfitRatio("");
      dispatch(tradeAction.onTakeProfitRatioChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setTakeProfitRatio(nextValue);
    dispatch(tradeAction.onTakeProfitRatioChange(parsed));
  };

  const onStopLossRatioChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setStopLossRatio("");
      dispatch(tradeAction.onStopLossRatioChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setStopLossRatio(nextValue);
    dispatch(tradeAction.onStopLossRatioChange(parsed));
  };

  const onPoolsChange = (nextPools: any[]) => {
    dispatch(tradeAction.onPoolsChange(nextPools));
  };

  return {
    type,
    unit,
    leverage,
    collateral,
    contractQuantity,
    takeProfitRatio,
    stopLossRatio,
    pools,
    onTypeToggle,
    onUnitToggle,
    onLeverageChange,
    onCollateralChange,
    onContractQuantityChange,
    onTakeProfitRatioChange,
    onStopLossRatioChange,
    onPoolsChange,
  };
};

export default useTradeInput;
