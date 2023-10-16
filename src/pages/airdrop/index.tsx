import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { Tab } from '@headlessui/react';
import '~/stories/atom/Tabs/style.css';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { BlurText } from '~/stories/atom/BlurText';

import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';

import './style.css';

function Airdrop() {
  useTokenLocal();
  useMarketLocal();

  return (
    <>
      <div className="flex flex-col min-h-[100vh] w-full relative">
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
                <Tab.Panels className="flex-auto">
                  <Tab.Panel>
                    <div className="w-[560px]">
                      <BlurText
                        label="Chromatic Airdrop Program"
                        className="text-[60px]"
                        color="chrm"
                      />
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>Content 2</Tab.Panel>
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
