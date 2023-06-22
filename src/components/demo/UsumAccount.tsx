import { useEffect } from "react";
import { useMarket, useMarketSelect } from "~/hooks/useMarket";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useSettlementToken, useTokenSelect } from "~/hooks/useSettlementToken";
import { useAccount } from "wagmi";
import { useFeeRate } from "~/hooks/useFeeRate";
import { infoLog } from "~/utils/log";

const UsumAccount = () => {
  useAccount();
  const feeRate = useFeeRate();
  const { account, createAccount } = useUsumAccount();
  const { markets } = useMarket();
  const { tokens } = useSettlementToken();
  const onTokenSelect = useTokenSelect();
  const onMarketSelect = useMarketSelect();

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
          tokens && onTokenSelect(tokens[0]);
        }}
      >
        Select Token
      </button>
      <div>
        {markets?.map((market) => (
          <div
            key={market.address}
            onClick={() => {
              onMarketSelect(market);
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
