import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { Tab } from '@headlessui/react';
import '~/stories/atom/Tabs/style.css';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { BlurText } from '~/stories/atom/BlurText';
import { AirdropStamp } from '~/stories/template/AirdropStamp';
import { AirdropHistory } from '~/stories/template/AirdropHistory';

import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';

import './style.css';

function Airdrop() {
  useTokenLocal();
  useMarketLocal();

  return (
    <>
      <div className="flex flex-col min-h-[100vh] w-full relative bg-gradient">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <section className="flex flex-col grow w-full min-w-[1280px] items-stretch px-10 mt-16 mx-auto mb-20">
          <div className="tabs tabs-flex-column">
            <Tab.Group>
              <div className="flex gap-10">
                <Tab.List className="tabs-list min-w-[200px]">
                  <Tab>Airdrop 1</Tab>
                  <Tab>My History</Tab>
                  <Tab>How to Participate</Tab>
                </Tab.List>
                <Tab.Panels className="flex-auto block">
                  <Tab.Panel>
                    <section>
                      <div className="w-[560px]">
                        <BlurText
                          label="Chromatic Airdrop Program"
                          className="text-[60px]"
                          color="chrm"
                        />
                      </div>
                      <div className="flex items-baseline justify-between mt-10">
                        <p className="text-xl text-primary-light">
                          Airdrop season 1 for Testnet has just begun!
                        </p>
                        <p className="text-xl text-primary-light">
                          Airdrop 1 period: Oct 20 2023 ~ Jan 20 2024
                        </p>
                      </div>
                    </section>
                    <section className="flex flex-col gap-24 mt-16">
                      <article>
                        <AirdropStamp />
                      </article>
                      <article>{/* <AirdropActivity/> */}</article>
                      <article>{/* <AirderopRandombox/> */}</article>
                      <article>{/* <AirdropBoard /> */}</article>
                    </section>
                  </Tab.Panel>
                  <Tab.Panel>
                    <section>
                      <BlurText label="My History" className="text-[60px]" color="chrm" />
                      <div className="mt-5 text-left">
                        <p className="text-xl text-primary-light">
                          Get to the top of the leaderboard to boost your points. <br />
                          The top 100 on a rolling 24H basis get a boost!
                        </p>
                      </div>
                      <div className="p-5 mt-10 panel">
                        <div className="flex justify-between">
                          <div className="w-1/3">
                            <h2 className="text-4xl">10</h2>
                            <h4 className="mt-3 text-xl text-primary-light">Participants</h4>
                          </div>
                          <div className="w-1/3 border-l">
                            <h2 className="text-4xl">3,445</h2>
                            <h4 className="mt-3 text-xl text-primary-light">2 Key Holders</h4>
                          </div>
                          <div className="w-1/3 border-l">
                            <h2 className="text-4xl">13</h2>
                            <h4 className="mt-3 text-xl text-primary-light">Total Credits</h4>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="mt-16">
                      <AirdropHistory />
                    </section>
                  </Tab.Panel>
                  <Tab.Panel>Content 3</Tab.Panel>
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>
        </section>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
}

export default Airdrop;
