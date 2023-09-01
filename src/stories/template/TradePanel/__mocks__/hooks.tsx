import { useState } from 'react';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export function useTradePanel() {
  const [isWideView, setIsWideView] = useState(false);

  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => setSelectedTab(tab);

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
