import React, { useEffect } from 'react';
import { Header } from '../../stories/template/Header';
import { MainBar } from '../../stories/template/MainBar';
import { PoolPanel } from '../../stories/template/PoolPanel';
import { PoolProgress } from '~/stories/molecule/PoolProgress';
import { Footer } from '../../stories/template/Footer';
import { Button } from '../../stories/atom/Button';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Square2StackIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import './style.css';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import useConnectOnce from '~/hooks/useConnectOnce';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useTokenSelect, useSettlementToken } from '~/hooks/useSettlementToken';
import { useMarket, useMarketSelect } from '~/hooks/useMarket';
import { useUsumBalances, useUsumMargins, useWalletBalances } from '~/hooks/useBalances';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useLiquidityPoolSummary, useBinsBySelectedMarket } from '~/hooks/useLiquidityPool';
import useTokenTransaction from '~/hooks/useTokenTransaction';
import { copyText } from '~/utils/clipboard';
import { useFeeRate } from '~/hooks/useFeeRate';
import { Link } from 'react-router-dom';
import { trimAddress } from '~/utils/address';
import usePoolInput from '~/hooks/usePoolInput';
import { useAppSelector } from '~/store';
import usePoolReceipt from '~/hooks/usePoolReceipt';
import { useMultiPoolRemoveInput, usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useTokenLocal } from '../../hooks/useTokenLocal';
import { useMarketLocal } from '../../hooks/useMarketLocal';
import { useOwnedLiquidityPool } from '../../hooks/useOwnedLiquidityPool';
import useChartData from '../../hooks/useChartData';
import { Outlink } from '../../stories/atom/Outlink';
import { LiquidityTooltip } from '../../stories/molecule/LiquidityTooltip';

const Pool = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const { account: usumAccount, createAccount: createUsumAccount, status } = useUsumAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const onTokenSelect = useTokenSelect();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const onMarketSelect = useMarketSelect();
  const feeRate = useFeeRate();
  const { walletBalances } = useWalletBalances();
  const { usumBalances } = useUsumBalances();
  const { priceFeed } = usePriceFeed();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const {
    amount: balanceAmount,
    onAmountChange: onBalanceAmountChange,
    onDeposit,
    onWithdraw,
  } = useTokenTransaction();
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const isRemoveModalOpen = useAppSelector((state) => state.pools.isModalOpen);
  const { receipts, onClaimCLBTokens, onClaimCLBTokensBatch } = usePoolReceipt();
  const {
    pool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
    onRemoveLiquidity,
    onRemoveLiquidityBatch,
  } = useBinsBySelectedMarket();

  const {
    amount,
    rates,
    binCount,
    binAverage,
    onAmountChange,
    onRangeChange,
    onAddLiquidity,
    move,
    isLoading,
    rangeChartRef,
  } = usePoolInput();
  const {
    amount: removeAmount,
    maxAmount: maxRemoveAmount,
    onAmountChange: onRemoveAmountChange,
    onMaxChange: onRemoveMaxAmountChange,
  } = usePoolRemoveInput();
  const {
    type: multiType,
    amount: multiAmount,
    clbTokenBalance: multiClbTokenBalance,
    liquidityValue: multiLiquidityValue,
    removableLiquidity: multiFreeLiquidity,
    removableRate: multiRemovableRate,
    onAmountChange: onMultiAmountChange,
  } = useMultiPoolRemoveInput();
  const { totalBalance, totalAsset, totalMargin } = useUsumMargins();
  useTokenLocal();
  useMarketLocal();

  const { liquidity, clbTokenValue: binValue, tooltip } = useChartData();

  const getTooltipByIndex = (index: number) => tooltip[index];

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <Header
        account={{ walletAddress, usumAddress: usumAccount?.address }}
        tokens={tokens}
        markets={markets}
        priceFeed={priceFeed}
        balances={walletBalances}
        pools={pools}
        onConnect={() => {
          connectAsync({
            connector: new InjectedConnector(),
          });
        }}
        onCreateAccount={createUsumAccount}
        onDisconnect={disconnectAsync}
        onWalletCopy={copyText}
        onUsumCopy={copyText}
      />
      <section className="flex flex-col grow w-full max-w-[1400px] px-5 mx-auto mb-20">
        <MainBar
          account={{ walletAddress, usumAddress: usumAccount?.address }}
          status={status}
          tokens={tokens}
          markets={markets}
          selectedToken={selectedToken}
          selectedMarket={selectedMarket}
          feeRate={feeRate}
          walletBalances={walletBalances}
          usumBalances={usumBalances}
          amount={balanceAmount}
          totalBalance={totalBalance}
          availableMargin={totalMargin}
          assetValue={totalAsset}
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onBalanceAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="flex items-stretch gap-5">
          <div className="flex-auto w-3/5 min-w-[620px]">
            <PoolPanel
              token={selectedToken}
              market={selectedMarket}
              balances={walletBalances}
              pool={pool}
              amount={amount}
              rates={rates}
              binCount={binCount}
              binAverage={binAverage}
              binValue={binValue}
              liquidity={liquidity}
              longTotalMaxLiquidity={longTotalMaxLiquidity}
              longTotalUnusedLiquidity={longTotalUnusedLiquidity}
              shortTotalMaxLiquidity={shortTotalMaxLiquidity}
              shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
              selectedBins={selectedBins}
              isModalOpen={isRemoveModalOpen}
              isLoading={isLoading}
              onAmountChange={onAmountChange}
              onRangeChange={onRangeChange}
              onAddLiquidity={onAddLiquidity}
              rangeChartRef={rangeChartRef}
              onMinIncrease={move.left.next}
              onMinDecrease={move.left.prev}
              onMaxIncrease={move.right.next}
              onMaxDecrease={move.right.prev}
              onFullRange={move.full}
              tooltip={<LiquidityTooltip getByIndex={getTooltipByIndex} />}
              removeAmount={removeAmount}
              maxRemoveAmount={maxRemoveAmount}
              onRemoveAmountChange={onRemoveAmountChange}
              onRemoveMaxAmountChange={onRemoveMaxAmountChange}
              onRemoveLiquidity={onRemoveLiquidity}
              onRemoveLiquidityBatch={onRemoveLiquidityBatch}
              multiType={multiType}
              multiAmount={multiAmount}
              multiBalance={multiClbTokenBalance}
              multiLiquidityValue={multiLiquidityValue}
              multiFreeLiquidity={multiFreeLiquidity}
              multiRemovableRate={multiRemovableRate}
              onMultiAmountChange={onMultiAmountChange}
            />
            {/* bottom */}
            <article className="p-5 mx-auto mt-5 bg-white border shadow-lg rounded-2xl">
              <div className="flex items-center justify-between w-full gap-1">
                <h4 className="font-bold">Token(ERC-1155) Contract Address</h4>
                <AddressCopyButton
                  address={selectedToken && trimAddress(selectedToken.address, 6, 6)}
                  onClick={() => {
                    if (selectedToken) {
                      copyText(selectedToken.address);
                    }
                  }}
                />
              </div>
              <p className="mt-3 mb-3 text-left text-black/30">
                When providing liquidity to the liquidity bins of the Chromatic protocol, providers
                are rewarded by minting CLB tokens. CLB tokens follow the ERC-1155 standard and have
                one token contract per market, with each bin having its own unique token ID.
                <Outlink outLink="#" className="ml-2" />
              </p>
            </article>
            <div className="mt-10">
              <Link to={'/trade'}>
                <Button label="Trade on ETH/USDC Pool" iconRight={<ChevronRightIcon />} />
              </Link>
            </div>
          </div>
          <div className="w-2/5 max-w-[500px] min-w-[480px]">
            <PoolProgress
              token={selectedToken}
              market={selectedMarket}
              receipts={receipts}
              onReceiptClaim={onClaimCLBTokens}
              onReceiptClaimBatch={onClaimCLBTokensBatch}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pool;
