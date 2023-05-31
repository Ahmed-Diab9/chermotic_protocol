import { OracleProvider__factory, USUMMarket__factory } from "@quarkonix/usum";
import { useSelectedMarket } from "./useMarket";
import { isValid } from "../utils/valid";
import { useProvider } from "wagmi";
import useLocalStorage from "./useLocalStorage";
import { bigNumberify } from "../utils/number";
import { useEffect } from "react";
import { BigNumber } from "ethers";

const useOracleVersion = () => {
  const [storedOracleVersion, setOracleVersion] =
    useLocalStorage<[string, string]>("usum:oracleVersion");
  const [market] = useSelectedMarket();
  const provider = useProvider();

  useEffect(() => {
    const compareVersion = async () => {
      if (!isValid(market)) {
        return;
      }
      const contract = USUMMarket__factory.connect(market.address, provider);
      const oracleProviderAddress = await contract.oracleProvider();
      const oracleProvider = OracleProvider__factory.connect(
        oracleProviderAddress,
        provider
      );
      const { version: oracleVersion } = await oracleProvider.currentVersion();
      if (!isValid(storedOracleVersion)) {
        setOracleVersion([market.address, oracleVersion.toString()]);
        return;
      }
      if (storedOracleVersion[0] !== market.address) {
        setOracleVersion([market.address, oracleVersion.toString()]);
        return;
      }
      const oldOracleVersion = bigNumberify(storedOracleVersion[1]);
      if (isValid(oldOracleVersion) && oracleVersion.gt(oldOracleVersion)) {
        // TODO @austin-builds
        // Create a action when oracle version is updated
        return;
      }
    };
    let timerId = setTimeout(async function handler() {
      await compareVersion();

      timerId = setTimeout(handler, 10000);
    }, 10000);

    compareVersion();

    return () => {
      clearTimeout(timerId);
    };
  }, [provider, market, storedOracleVersion, setOracleVersion]);

  if (isValid(storedOracleVersion)) {
    return [
      storedOracleVersion[0],
      bigNumberify(storedOracleVersion[1]) as BigNumber,
    ] as const;
  }
  return [undefined, undefined] as const;
};

export default useOracleVersion;
