import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useFeeRate } from '~/hooks/useFeeRate';
import { useMarket } from '~/hooks/useMarket';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { Logger } from '~/utils/log';
const logger = Logger('UsumAccount');
const UsumAccount = () => {
  useAccount();
  const feeRate = useFeeRate();
  const { accountAddress, createAccount } = useUsumAccount();
  const { markets, onMarketSelect } = useMarket();
  const { tokens, onTokenSelect } = useSettlementToken();
  // const onTokenSelect = useTokenSelect();
  // const onMarketSelect = useMarketSelect();

  useEffect(() => {
    logger.info('feeRate', feeRate);
  }, [feeRate]);

  return (
    <div>
      <h2>Account</h2>
      <p>{accountAddress}</p>
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
