import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './style.css';

import { ChevronRightIcon } from '@heroicons/react/24/outline';

import { Button } from '~/stories/atom/Button';
import { Outlink } from '~/stories/atom/Outlink';
import { Header } from '~/stories/template/Header';
import { MainBar } from '~/stories/template/MainBar';
import { TradeBar } from '~/stories/template/TradeBar';
import { TradePanel } from '~/stories/template/TradePanel';

import useChartData from '~/hooks/useChartData';
import useConnectOnce from '~/hooks/useConnectOnce';
import { useFeeRate } from '~/hooks/useFeeRate';
import { useLiquidityPool, useLiquidityPoolSummary } from '~/hooks/useLiquidityPool';
import { useMarket } from '~/hooks/useMarket';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import useOracleVersion from '~/hooks/useOracleVersion';
import { usePosition } from '~/hooks/usePosition';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import useTokenTransaction from '~/hooks/useTokenTransaction';
import { useTradeInput } from '~/hooks/useTradeInput';
import { useUsumAccount } from '~/hooks/useUsumAccount';

import { copyText } from '~/utils/clipboard';
import { useMargins } from '~/hooks/useMargins';
import { Toast } from '~/stories/atom/Toast';

const Trade = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    accountAddress: usumAccount,
    createAccount: createUsumAccount,
    isChromaticBalanceLoading,
    status,
    balances,
  } = useUsumAccount();
  const { tokens, onTokenSelect, currentSelectedToken, isTokenLoading } = useSettlementToken();
  const { markets, onMarketSelect, currentMarket, isMarketLoading } = useMarket();
  const { feeRate, isFeeRateLoading } = useFeeRate();
  const { useTokenBalances: walletBalances, isTokenBalanceLoading } = useTokenBalances();

  const { priceFeed, isFeedLoading } = usePriceFeed();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const { amount, onAmountChange, onDeposit, onWithdraw } = useTokenTransaction();
  const {
    state: longInput,
    tradeFee: longTradeFee,
    feePercent: longFeePercent,
    onChange: onLongChange,
    onMethodToggle: onLongMethodToggle,
    onLeverageChange: onLongLeverageChange,
    onTakeProfitChange: onLongTakeProfitChange,
    onStopLossChange: onLongStopLossChange,
  } = useTradeInput();
  const {
    state: shortInput,
    tradeFee: shortTradeFee,
    feePercent: shortFeePercent,
    onChange: onShortChange,
    onMethodToggle: onShortMethodToggle,
    onDirectionToggle: onShortDirectionToggle,
    onLeverageChange: onShortLeverageChange,
    onTakeProfitChange: onShortTakeProfitChange,
    onStopLossChange: onShortStopLossChange,
  } = useTradeInput();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();
  const { oracleVersions } = useOracleVersion();

  useEffect(() => {
    if (shortInput.direction === 'long') {
      onShortDirectionToggle();
    }
  }, [shortInput.direction, onShortDirectionToggle]);
  const { positions, isPositionsLoading } = usePosition();
  useTokenLocal();
  useMarketLocal();

  const { positive, negative } = useChartData();
  const { totalBalance, totalAsset, totalMargin } = useMargins();

  return (
    <div className="flex flex-col min-h-[100vh] w-full bg-grayBG">
      <Header
        account={{ walletAddress, usumAddress: usumAccount }}
        tokens={tokens}
        markets={markets}
        priceFeed={priceFeed}
        balances={walletBalances}
        pools={pools}
        isBalanceLoading={isTokenBalanceLoading && isChromaticBalanceLoading}
        onConnect={connectAsync}
        onCreateAccount={createUsumAccount}
        onDisconnect={disconnectAsync}
        onWalletCopy={copyText}
        onUsumCopy={copyText}
      />
      <section className="flex flex-col grow w-full max-w-[1200px] items-stretch px-5 mx-auto mb-20">
        <MainBar
          account={{ walletAddress, usumAddress: usumAccount }}
          status={status}
          tokens={tokens}
          markets={markets}
          selectedToken={currentSelectedToken}
          selectedMarket={currentMarket}
          feeRate={feeRate}
          walletBalances={walletBalances}
          usumBalances={balances}
          amount={amount}
          totalBalance={totalBalance}
          availableMargin={totalMargin}
          assetValue={totalAsset}
          isMarketLoading={isMarketLoading && isFeeRateLoading}
          isAssetLoading={isTokenLoading && isTokenBalanceLoading && isFeedLoading}
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="w-full">
          <TradePanel
            longInput={longInput}
            longTradeFee={longTradeFee}
            longTradeFeePercent={longFeePercent}
            onLongChange={onLongChange}
            onLongMethodToggle={onLongMethodToggle}
            onLongLeverageChange={onLongLeverageChange}
            onLongTakeProfitChange={onLongTakeProfitChange}
            onLongStopLossChange={onLongStopLossChange}
            shortInput={shortInput}
            shortTradeFee={shortTradeFee}
            shortTradeFeePercent={shortFeePercent}
            onShortChange={onShortChange}
            onShortMethodToggle={onShortMethodToggle}
            onShortLeverageChange={onShortLeverageChange}
            onShortTakeProfitChange={onShortTakeProfitChange}
            onShortStopLossChange={onShortStopLossChange}
            balances={balances}
            priceFeed={priceFeed}
            token={currentSelectedToken}
            market={currentMarket}
            longTotalMaxLiquidity={longTotalMaxLiquidity}
            longTotalUnusedLiquidity={longTotalUnusedLiquidity}
            shortTotalMaxLiquidity={shortTotalMaxLiquidity}
            shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
            shortLiquidityData={negative}
            longLiquidityData={positive}
          />
          <article className="w-full mx-auto mt-8 max-w-[840px]">
            <div className="mb-12 text-base">
              <div className="my-6 text-center text-black/30">
                The Trade Fee is calculated by summing up the different fees from the Liquidi- ty
                Bins that accept the positions. The EST. Trade Fee is calculated based on the
                current oracle price, and the actual fee paid is determined by the next oracle
                price.
                <Outlink outLink="#" className="ml-2" />
              </div>
              <Link to={'/pool'}>
                <Button label="Provide Liquidity" iconRight={<ChevronRightIcon />} />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <TradeBar
        token={currentSelectedToken}
        markets={markets}
        positions={positions}
        oracleVersions={oracleVersions}
        isLoading={isPositionsLoading}
      />
      <Toast />
    </div>
  );
};

export default Trade;
