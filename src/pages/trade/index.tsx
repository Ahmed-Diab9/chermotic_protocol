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
import { useLiquiditiyPool, useLiquidityPoolSummary } from '~/hooks/useLiquidityPool';
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

import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { copyText } from '~/utils/clipboard';
import { oracle } from '@chromatic-protocol/sdk/dist/cjs/gen/contracts';

const Trade = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    accountAddress: usumAccount,
    createAccount: createUsumAccount,
    status,
    balances,
    totalBalance,
    totalAsset,
    totalMargin,
  } = useUsumAccount();
  const { tokens, onTokenSelect, currentSelectedToken } = useSettlementToken();
  const { markets, onMarketSelect, currentMarket } = useMarket();
  const feeRate = useFeeRate();
  const { useTokenBalances: walletBalances } = useTokenBalances();

  const { priceFeed } = usePriceFeed();
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
    onOpenPosition: onOpenLongPosition,
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
    onOpenPosition: onOpenShortPosition,
  } = useTradeInput();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquiditiyPool();
  const { oracleVersions } = useOracleVersion();

  useEffect(() => {
    if (shortInput.direction === 'long') {
      onShortDirectionToggle();
    }
  }, [shortInput.direction, onShortDirectionToggle]);
  const { positions, onClosePosition, onClaimPosition } = usePosition();
  useTokenLocal();
  useMarketLocal();

  const { liquidity, positive, negative } = useChartData();

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <LiquidityTooltip data={liquidity} />
      <Header
        account={{ walletAddress, usumAddress: usumAccount }}
        tokens={tokens}
        markets={markets}
        priceFeed={priceFeed}
        balances={walletBalances}
        pools={pools}
        onConnect={connectAsync}
        onCreateAccount={createUsumAccount}
        onDisconnect={disconnectAsync}
        onWalletCopy={copyText}
        onUsumCopy={copyText}
      />
      <section className="flex flex-col grow w-full max-w-[1400px] px-5 mx-auto mb-20">
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
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="w-full min-w-[620px]">
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
            onOpenLongPosition={onOpenLongPosition}
            onOpenShortPosition={onOpenShortPosition}
          />
          <article className="w-full mx-auto mt-8 max-w-[840px]">
            <div className="mb-12">
              <p className="my-6 text-center text-black/30">
                The Trade Fee is calculated by summing up the different fees from the Liquidi- ty
                Bins that accept the positions. The EST. Trade Fee is calculated based on the
                current oracle price, and the actual fee paid is determined by the next oracle
                price.
                <Outlink outLink="#" className="ml-2" />
              </p>
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
        onPositionClose={onClosePosition}
        onPositionClaim={onClaimPosition}
      />
    </div>
  );
};

export default Trade;
