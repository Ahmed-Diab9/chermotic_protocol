import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '~/stories/atom/Outlink';
import { Toast } from '~/stories/atom/Toast';
import { Header } from '~/stories/container/Header';
import { TradeBar } from '~/stories/container/TradeBar';
import { TradePanel } from '~/stories/container/TradePanel';
import { MainBar } from '~/stories/template/MainBar';
import './style.css';

const Trade = () => {
  useTokenLocal();
  useMarketLocal();

  return (
    <div className="flex flex-col min-h-[100vh] w-full bg-grayLbg dark:bg-black1">
      <Header />
      <section className="flex flex-col grow w-full max-w-[1200px] items-stretch px-5 mx-auto mb-20">
        <MainBar showAccountPopover={true} />
        <div className="w-full">
          <TradePanel />
          <article className="w-full mx-auto mt-8 max-w-[840px]">
            <div className="mb-12 text-base">
              <div className="my-6 text-center text-black3 dark:text-white2">
                The Trade Fee is calculated by summing up the different fees from the Liquidity Bins
                that accept the positions. The EST. Trade Fee is calculated based on the current
                oracle price, and the actual fee paid is determined by the next oracle price.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/fee/trading-fee" />
              </div>
              <Link to={'/pool'}>
                <Button label="Provide Liquidity" iconRight={<ChevronRightIcon />} />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <TradeBar />
      <Toast />
      {/* todo: Add Modal (Wrong Netwrok) */}
      {/* <Modal
        title="Wrong Network"
        paragraph="Please set network to Arbitrum"
        subParagraph="Check your wallet and sign to change network."
        buttonLabel="Try Again"
        buttonCss="gray"
      /> */}
    </div>
  );
};

export default Trade;
