import { useMemo, useState } from 'react';
import { useAirdropLeaderBoard } from '~/hooks/useAirdropLeaderBoard';

const filterLabels = ['Today', 'Yesterday', 'All Time'] as const;
const labelMap = {
  Today: 'today',
  Yesterday: 'yesterday',
  'All Time': 'all',
} as const;

export const useAirdropBoard = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeLabel = useMemo(() => {
    return filterLabels[selectedIndex];
  }, [selectedIndex]);
  const { leaderboardData, isLoading } = useAirdropLeaderBoard({
    type: labelMap[filterLabels[selectedIndex]],
  });
  const leaderboard = useMemo(() => {
    return leaderboardData.map((board) => board.data).flat(1);
  }, [leaderboardData]);

  const onLabelChange = (nextIndex: number) => {
    setSelectedIndex(nextIndex);
  };

  return {
    filterLabels,
    activeLabel,
    leaderboard,
    onLabelChange,
  };
};
