import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import useConnectOnce from '~/hooks/useConnectOnce';
import { useFeeRate } from '~/hooks/useFeeRate';
import { useLiquiditiyPool, useLiquidityPoolSummary } from '~/hooks/useLiquidityPool';
import { useMargins } from '~/hooks/useMargins';
import { useMarket } from '~/hooks/useMarket';
import usePoolInput from '~/hooks/usePoolInput';
import usePoolReceipt from '~/hooks/usePoolReceipt';
import { useMultiPoolRemoveInput, usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import useTokenTransaction from '~/hooks/useTokenTransaction';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { useAppSelector } from '~/store';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Toast } from '~/stories/atom/Toast';
import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { PoolProgress } from '~/stories/molecule/PoolProgress';
import { trimAddress } from '~/utils/address';
import { copyText } from '~/utils/clipboard';
import useChartData from '../../hooks/useChartData';
import { useMarketLocal } from '../../hooks/useMarketLocal';
import { useOwnedLiquidityPool } from '../../hooks/useOwnedLiquidityPool';
import { useTokenLocal } from '../../hooks/useTokenLocal';
import { Button } from '../../stories/atom/Button';
import { Outlink } from '../../stories/atom/Outlink';
import { Footer } from '../../stories/template/Footer';
import { Header } from '../../stories/template/Header';
import { MainBar } from '../../stories/template/MainBar';
import { PoolPanel } from '../../stories/template/PoolPanel';
import './style.css';

const Pool = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    accountAddress: chromaticAccountAddress,
    createAccount: createUsumAccount,
    status,
    balances,
    isChromaticBalanceLoading,
  } = useUsumAccount();
  const {
    tokens,
    currentSelectedToken: selectedToken,
    isTokenLoading,
    onTokenSelect,
  } = useSettlementToken();
  const { markets, currentMarket: selectedMarket, isMarketLoading, onMarketSelect } = useMarket();
  const { feeRate, isFeeRateLoading } = useFeeRate();
  const { useTokenBalances: walletBalances, isTokenBalanceLoading } = useTokenBalances();
  // const { usumBalances } = useUsumBalances();
  const { priceFeed, isFeedLoading } = usePriceFeed();
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
  const { receipts, onClaimCLBTokens, onClaimCLBTokensBatch, isReceiptsLoading } = usePoolReceipt();

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
  } = useLiquiditiyPool();
  const { ownedPool } = useOwnedLiquidityPool();
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
    onAmountChange: onMultiAmountChange,
  } = useMultiPoolRemoveInput();
  useTokenLocal();
  useMarketLocal();
  const { totalBalance, totalAsset, totalMargin } = useMargins();
  const { liquidity, clbTokenValue } = useChartData();

  return (
    <div className="flex flex-col min-h-[100vh] w-full bg-grayBG">
      <LiquidityTooltip data={liquidity} />
      <Header
        account={{ walletAddress, usumAddress: chromaticAccountAddress }}
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
        isBalanceLoading={isTokenBalanceLoading && isChromaticBalanceLoading}
      />
      <section className="flex flex-col grow w-full max-w-[1200px] px-5 mx-auto mb-20">
        <MainBar
          account={{ walletAddress, usumAddress: chromaticAccountAddress }}
          status={status}
          tokens={tokens}
          markets={markets}
          selectedToken={selectedToken}
          selectedMarket={selectedMarket}
          feeRate={feeRate}
          walletBalances={walletBalances}
          usumBalances={balances}
          amount={balanceAmount}
          totalBalance={totalBalance}
          availableMargin={totalMargin}
          assetValue={totalAsset}
          isMarketLoading={isMarketLoading && isFeeRateLoading}
          isAssetLoading={isTokenLoading && isTokenBalanceLoading && isFeedLoading}
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onBalanceAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="flex items-stretch gap-3">
          <div className="flex-auto w-3/5">
            <PoolPanel
              token={selectedToken}
              market={selectedMarket}
              balances={walletBalances}
              ownedPool={ownedPool}
              amount={amount}
              rates={rates}
              binCount={binCount}
              binAverage={binAverage}
              clbTokenValue={clbTokenValue}
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
              removeAmount={removeAmount}
              maxRemoveAmount={maxRemoveAmount}
              onRemoveAmountChange={onRemoveAmountChange}
              onRemoveMaxAmountChange={onRemoveMaxAmountChange}
              onRemoveLiquidity={onRemoveLiquidity}
              onRemoveLiquidityBatch={onRemoveLiquidityBatch}
              multiType={multiType}
              multiAmount={multiAmount}
              multiBalance={multiClbTokenBalance}
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
              <div className="mt-3 mb-3 text-base text-left text-black/30">
                When providing liquidity to the liquidity bins of the Chromatic protocol, providers
                are rewarded by minting CLB tokens. CLB tokens follow the ERC-1155 standard and have
                one token contract per market, with each bin having its own unique token ID.
                <Outlink outLink="#" className="ml-2" />
              </div>
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
              isLoading={isReceiptsLoading}
              onReceiptClaim={onClaimCLBTokens}
              onReceiptClaimBatch={onClaimCLBTokensBatch}
            />
          </div>
        </div>
      </section>
      <Footer />
      <Toast />
    </div>
  );
};

export default Pool;
