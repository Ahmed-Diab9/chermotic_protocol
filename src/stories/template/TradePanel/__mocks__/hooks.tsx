import { useState } from 'react';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export function useTradePanel() {
  const [isWideView, setIsWideView] = useState(false);

  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => {
    switch (tab) {
      case POSITION_TAB.SHORT_TAB: {
        return setSelectedTab(POSITION_TAB.SHORT_TAB);
      }
      case POSITION_TAB.LONG_TAB: {
        return setSelectedTab(POSITION_TAB.LONG_TAB);
      }
      default: {
        return;
      }
    }
  };

  function onClickLeftCollapseView() {
    setIsWideView(false);
    onSelectTab(POSITION_TAB.SHORT_TAB);
  }

  function onClickRightCollapseView() {
    setIsWideView(false);
    onSelectTab(POSITION_TAB.LONG_TAB);
  }

  function onClickExpandView() {
    setIsWideView(true);
  }

  return {
    selectedTab,
    onSelectTab,
    isWideView,
    onClickLeftCollapseView,
    onClickRightCollapseView,
    onClickExpandView,
  };
}
