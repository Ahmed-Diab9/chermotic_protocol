import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '~/stories/atom/Outlink';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { Header } from '~/stories/template/Header';
import { TradeBar } from '~/stories/template/TradeBar';
import { MainBar } from '~/stories/template/MainBar';
import { TradePanelV2 } from '~/stories/template/TradePanelV2';
import './style.css';

function TradeV2() {
  useTokenLocal();
  useMarketLocal();

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <div className="absolute top-0 h-[70px] w-full flex items-center justify-center opacity-80">
        [trade v2]
      </div>
      <Header />
      <section className="flex flex-col grow w-full max-w-[1200px] items-stretch px-5 mx-auto mb-20">
        <MainBar accountPopover />
        <div className="w-full">
          <TradePanelV2 />
          <article className="w-full mx-auto mt-8 max-w-[840px]">
            <div className="mb-12 text-base">
              <div className="my-6 text-center text-primary-lighter">
                The Trade Fee is calculated by summing up the different fees from the Liquidity Bins
                that accept the positions. The EST. Trade Fee is calculated based on the current
                oracle price, and the actual fee paid is determined by the next oracle price.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/fee/trading-fee" />
              </div>
              <Link to={'/pool'}>
                <Button
                  label="Provide Liquidity"
                  css="light"
                  className="dark:!bg-paper-light dark:hover:!bg-gray-light"
                  iconRight={<ChevronRightIcon />}
                />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <TradeBar />
      <Toast />
      <ChainModal />
    </div>
  );
}

export default TradeV2;
