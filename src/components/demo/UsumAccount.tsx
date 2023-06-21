import { useEffect } from "react";
import { useMarket, useSelectedMarket } from "~/hooks/useMarket";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import {
  useSelectedToken,
  useSettlementToken,
} from "~/hooks/useSettlementToken";
import { useAccount } from "wagmi";
import { useFeeRate } from "~/hooks/useFeeRate";
import { infoLog } from "~/utils/log";

const UsumAccount = () => {
  useAccount();
  const feeRate = useFeeRate();
  const { account, createAccount } = useUsumAccount();
  const { markets } = useMarket();
  const { tokens } = useSettlementToken();
  const [selectedToken, onTokenSelect] = useSelectedToken();
  const { selectedMarket, onMarketSelect } = useSelectedMarket();

  useEffect(() => {
    infoLog("feeRate", feeRate);
  }, [feeRate]);

  return (
    <div>
      <h2>Account</h2>
      <p>{account?.address}</p>
      <button onClick={() => createAccount()}>Create Account</button>
      <button
        onClick={() => {
          onTokenSelect(tokens?.[0].address as string);
        }}
      >
        Select Token
      </button>
      <div>
        {markets?.map((market) => (
          <div
            key={market.address}
            onClick={() => {
              onMarketSelect(market.address);
            }}
          >
            {market.description}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsumAccount;
