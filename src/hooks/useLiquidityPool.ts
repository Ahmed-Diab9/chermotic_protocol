import { useContract } from "wagmi";
import useSWR from "swr";
import { useAppDispatch, useAppSelector } from "../store";
import { useEffect, useState } from "react";
import { poolsAction } from "../store/reducer/pools";

const useLiquidityPool = () => {
  const [input, setInput] = useState("");
  const [minTradeFee, setMinTradeFee] = useState("");
  const [maxTradeFee, setMaxTradeFee] = useState("");
  const token = useAppSelector((state) => state.market.selectedToken);
  const pools = useAppSelector((state) => state.pools);
  const dispatch = useAppDispatch();
  const contract = useContract();
  const method = "POOLS";

  const { data: poolSlots } = useSWR(
    [contract, method, token.address],
    async ([contract, method, address]) => {
      const response: unknown = await contract[method]();

      return response;
    }
  );

  const onInputChange = (value: string) => {
    if (value.length === 0) {
      setInput("");
      dispatch(poolsAction.onInputChange(0));
      return;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    setInput(value);
    dispatch(poolsAction.onInputChange(parsed));
  };
  const onTypeToggle = (type: typeof pools.type) => {
    dispatch(poolsAction.onTypeToggle(type));
  };

  const onTradeFeeChange = (minmax: "MIN" | "MAX", value: string) => {
    if (value.length === 0) {
      if (minmax === "MIN") {
        setMinTradeFee("");
      } else {
        setMaxTradeFee("");
      }
      dispatch(poolsAction.onTradeFeeChange({ minmax, value: 0 }));
      return;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    if (minmax === "MIN") {
      setMinTradeFee(value);
    } else {
      setMaxTradeFee(value);
    }
    dispatch(poolsAction.onTradeFeeChange({ minmax, value: parsed }));
  };

  return {
    input,
    poolSlots,
    minTradeFee,
    maxTradeFee,
    onTypeToggle,
    onInputChange,
    onTradeFeeChange,
  };
};

export default useLiquidityPool;
