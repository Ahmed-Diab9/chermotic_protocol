import { isNil, isNotNil } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '~/constants/arbiscan';
import { useAirdropAssets } from '~/hooks/airdrops/useAirdropAssets';
import { useAirdropHistory } from '~/hooks/airdrops/useAirdropHistory';

const filterLabels = ['All', 'Credits', 'Booster'] as const;
const labelMap = {
  All: 'all',
  Credits: 'credits',
  Booster: 'booster',
} as const;

export const useFilteredAirdropHistory = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const { airdropHistory = [], refreshHistory } = useAirdropHistory();
  const { airdropAssets, isLoading } = useAirdropAssets();
  const activeLabel = useMemo(
    () => (isNotNil(selectedIndex) ? filterLabels[selectedIndex] : undefined),
    [selectedIndex]
  );
  const [page, setPage] = useState(0);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab !== 'history') {
      setSelectedIndex(0);
      return;
    }
    const label = searchParams.get('label');
    switch (label) {
      case 'credit': {
        setSelectedIndex(1);
        break;
      }
      case 'booster': {
        setSelectedIndex(2);
        break;
      }
      default: {
        setSelectedIndex(0);
        return;
      }
    }
  }, [searchParams]);

  const filteredHistory = useMemo(() => {
    if (isNil(activeLabel)) {
      return [];
    }
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

  const pagedHistory = useMemo(() => {
    return filteredHistory.slice(0, (page + 1) * PAGE_SIZE);
  }, [page, filteredHistory]);

  const hasMoreHistory = useMemo(() => {
    if (isNil(airdropAssets) || isNil(activeLabel)) {
      return false;
    }
    const sum = pagedHistory.reduce(
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
        return sum.booster < airdropAssets.booster || sum.credit < airdropAssets.credit;
      }
      case 'booster': {
        return sum.booster < airdropAssets.booster;
      }
      case 'credits': {
        return sum.credit < airdropAssets.credit;
      }
    }
  }, [pagedHistory, activeLabel, airdropAssets]);

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

  const fetchNextHistory = useCallback(() => {
    if (!hasMoreHistory) {
      return;
    }
    setPage(page + 1);
  }, [page, hasMoreHistory]);

  return {
    pagedHistory,
    filterLabels,
    labelMap,
    activeLabel,
    nameCounts,
    airdropAssets,
    hasMoreHistory,
    onLabelChange,
    refreshHistory,
    fetchNextHistory,
  };
};
