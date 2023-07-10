import { ACCOUNT_STATUS, Account } from '~/typings/account';
import { Market, Token } from '~/typings/market';
import { AssetPopover } from '../../molecule/AssetPopover';
import { MarketSelect } from '../../molecule/MarketSelect';

interface MainBarProps {
  account?: Account;
  status?: ACCOUNT_STATUS;
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  walletBalances?: Record<string, bigint>;
  usumBalances?: Record<string, bigint>;
  feeRate?: bigint;
  amount?: string;
  totalBalance?: bigint;
  availableMargin?: bigint;
  assetValue?: bigint;
  isMarketLoading?: boolean;
  isAssetLoading?: boolean;
  showAssetPopover?: boolean;
  onTokenSelect?: (token: Token) => unknown;
  onMarketSelect?: (market: Market) => unknown;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: () => unknown;
  onWithdraw?: () => unknown;
  onConnect?: () => unknown;
  onStatusUpdate?: () => unknown;
}

export const MainBar = ({
  account,
  status,
  tokens,
  markets,
  selectedToken,
  selectedMarket,
  walletBalances,
  usumBalances,
  feeRate,
  amount,
  totalBalance,
  availableMargin,
  assetValue,
  isMarketLoading,
  isAssetLoading,
  showAssetPopover,
  onAmountChange,
  onTokenSelect,
  onMarketSelect,
  onDeposit,
  onWithdraw,
  onConnect,
  onStatusUpdate,
}: MainBarProps) => (
  <div className="relative py-3">
    <div className="flex gap-3 justify-stretch">
      <div className="flex-auto w-3/5">
        <MarketSelect
          tokens={tokens}
          markets={markets}
          selectedToken={selectedToken}
          selectedMarket={selectedMarket}
          feeRate={feeRate}
          isLoading={isMarketLoading}
          onTokenClick={onTokenSelect}
          onMarketClick={onMarketSelect}
        />
      </div>
      {showAssetPopover && (
        <div className="w-2/5 max-w-[500px] min-w-[480px]">
          <AssetPopover
            account={account}
            status={status}
            selectedToken={selectedToken}
            walletBalances={walletBalances}
            usumBalances={usumBalances}
            amount={amount}
            totalBalance={totalBalance}
            availableMargin={availableMargin}
            assetValue={assetValue}
            isLoading={isAssetLoading}
            onAmountChange={onAmountChange}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
            onConnect={onConnect}
            onStatusUpdate={onStatusUpdate}
          />
        </div>
      )}
    </div>
  </div>
);
