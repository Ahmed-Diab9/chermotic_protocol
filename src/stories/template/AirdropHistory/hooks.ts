import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { useAirdropAssets } from '~/hooks/useAirdropAssets';
import { useAirdropHistory } from '~/hooks/useAirdropHistory';
import { numberFormat } from '~/utils/number';

const filterLabels = ['All', 'Credits', 'Booster'] as const;
const labelMap = {
  All: 'all',
  Credits: 'credits',
  Booster: 'booster',
} as const;

export const useFilteredAirdropHistory = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { airdropHistory = [], refreshHistory } = useAirdropHistory();
  const activeLabel = useMemo(() => filterLabels[selectedIndex], [selectedIndex]);

  const filteredHistory = useMemo(() => {
    const label = labelMap[filterLabels[selectedIndex]];
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
  }, [airdropHistory, selectedIndex]);

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

  const { airdropAssets, isLoading } = useAirdropAssets();

  const formattedCredit = useMemo(() => {
    if (isNil(airdropAssets)) {
      return '0';
    }
    return numberFormat(airdropAssets.credit, { useGrouping: true });
  }, [airdropAssets]);

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
    onLabelChange,
    refreshHistory,
  };
};
