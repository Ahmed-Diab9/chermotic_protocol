import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { useAirdropAssets } from '~/hooks/airdrops/useAirdropAssets';
import { useAirdropHistory } from '~/hooks/airdrops/useAirdropHistory';

const filterLabels = ['All', 'Credits', 'Booster'] as const;
const labelMap = {
  All: 'all',
  Credits: 'credits',
  Booster: 'booster',
} as const;

export const useFilteredAirdropHistory = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { airdropHistory = [], refreshHistory } = useAirdropHistory();
  const { airdropAssets, isLoading } = useAirdropAssets();
  const activeLabel = useMemo(() => filterLabels[selectedIndex], [selectedIndex]);

  const filteredHistory = useMemo(() => {
    const label = labelMap[activeLabel];
    if (label === 'all') {
      return airdropHistory;
    }
    return airdropHistory.filter((historyItem) => {
      switch (label) {
        case 'credits': {
          return historyItem.name === 'Credit';
        }
        case 'booster': {
          return historyItem.name === 'Booster';
        }
      }
    });
  }, [airdropHistory, activeLabel]);

  const hasMoreHistory = useMemo(() => {
    if (isNil(airdropAssets)) {
      return false;
    }
    const sum = airdropHistory.reduce(
      (sum, history) => {
        sum.credit += history.credit;
        sum.booster += history.booster;
        return sum;
      },
      { credit: 0, booster: 0 }
    );
    const label = labelMap[activeLabel];
    switch (label) {
      case 'all': {
        return airdropAssets.booster < sum.booster || airdropAssets.credit < sum.credit;
      }
      case 'booster': {
        return airdropAssets.booster < sum.booster;
      }
      case 'credits': {
        return airdropAssets.credit < sum.credit;
      }
    }
  }, [airdropHistory, activeLabel, airdropAssets]);

  const nameCounts = useMemo(() => {
    return airdropHistory.reduce(
      (counts, history) => {
        counts.all += 1;
        switch (history.name) {
          case 'Credit': {
            counts.credits += 1;
            break;
          }
          case 'Booster': {
            counts.booster += 1;
            break;
          }
        }
        return counts;
      },
      { all: 0, credits: 0, booster: 0 }
    );
  }, [airdropHistory]);

  const onLabelChange = useCallback((nextIndex: number) => {
    setSelectedIndex(nextIndex);
  }, []);

  return {
    filteredHistory,
    filterLabels,
    labelMap,
    activeLabel,
    nameCounts,
    airdropAssets,
    hasMoreHistory,
    onLabelChange,
    refreshHistory,
  };
};
