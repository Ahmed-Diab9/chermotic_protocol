import { useEffect } from "react";
import { useMarket } from "../../hooks/useMarket";
import useUsumAccount from "../../hooks/useUsumAccount";
import { useSettlementToken } from "../../hooks/useSettlementToken";
import { usePosition } from "../../hooks/usePosition";
import { useAccount } from "wagmi";

const UsumAccount = () => {
  useAccount();
  const [account, fetchAccount, createAccount] = useUsumAccount();
  const [markets] = useMarket();
  const [tokens] = useSettlementToken();
  const [positionIds, fetchPositionIds] = usePosition();

  useEffect(() => {
    console.log(markets);
  }, [markets]);

  useEffect(() => {
    console.log(tokens);
  }, [tokens]);

  useEffect(() => {
    console.log(positionIds);
  }, [positionIds]);

  return (
    <div>
      <h2>Account</h2>
      <p>{account}</p>
      <button onClick={() => createAccount()}>Create Account</button>
    </div>
  );
};

export default UsumAccount;
