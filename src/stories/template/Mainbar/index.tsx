import { MarketSelect } from "../../molecule/MarketSelect";
import { AssetPopover } from "../../molecule/AssetPopover";
import { Market, Token } from "~/typings/market";
import { BigNumber } from "ethers";
import { Account } from "~/typings/account";

interface MainBarProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  walletBalances?: Record<string, BigNumber>;
  usumBalances?: Record<string, BigNumber>;
  feeRate?: BigNumber;
  amount?: string;
  onTokenSelect?: (token: string) => unknown;
  onMarketSelect?: (market: string) => unknown;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: () => unknown;
  onWithdraw?: () => unknown;
  onConnect?: () => unknown;
}

export const MainBar = ({
  account,
  tokens,
  markets,
  selectedToken,
  selectedMarket,
  walletBalances,
  usumBalances,
  feeRate,
  amount,
  onAmountChange,
  onTokenSelect,
  onMarketSelect,
  onDeposit,
  onWithdraw,
  onConnect,
}: MainBarProps) => (
  <div className="px-10 py-5">
    <div className="flex gap-5 justify-stretch">
      <MarketSelect
        tokens={tokens}
        markets={markets}
        selectedToken={selectedToken}
        selectedMarket={selectedMarket}
        feeRate={feeRate}
        onTokenClick={onTokenSelect}
        onMarketClick={onMarketSelect}
      />
      <AssetPopover
        account={account}
        token={selectedToken}
        walletBalances={walletBalances}
        usumBalances={usumBalances}
        amount={amount}
        onAmountChange={onAmountChange}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        onConnect={onConnect}
      />
    </div>
  </div>
);
