import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';
import '~/stories/atom/Tabs/style.css';
import { TradeContentV2 } from '~/stories/molecule/TradeContentV2';
import './style.css';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export const TradePanelV2 = () => {
  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => setSelectedTab(tab);

  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsWide(screenWidth > 2000);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
        <div className="px-5 pt-4 pb-5 border-t bg-paper-light dark:bg-inverted-lighter">
          <div className="text-sm text-left text-primary-lighter">
            The Trade Fee is calculated by summing up the different fees from the Liquidity Bins
            that accept the positions. The EST. Trade Fee is calculated based on the current oracle
            price, and the actual fee paid is determined by the next oracle price.{' '}
            <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/fee/trading-fee" />
          </div>
        </div>
  );
};
