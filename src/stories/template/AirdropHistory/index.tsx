import { Button } from '~/stories/atom/Button';
import '~/stories/atom/Button/style.css';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';

import { useFilteredAirdropHistory } from './hooks';
import './style.css';

const historyList = [
  { category: 'Credits', score: '30', through: 'Zealy', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Booster', score: '20', through: 'Galxe NFT', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Booster', score: '20', through: 'Galxe NFT', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Credits', score: '30', through: 'Zealy', date: '2023/10/04 08:24:37 (UTC)' },
];

export const AirdropHistory = () => {
  const {
    pagedHistory = [],
    filterLabels,
    labelMap,
    activeLabel,
    nameCounts,
    hasMoreHistory,
    onLabelChange,
    fetchNextHistory,
  } = useFilteredAirdropHistory();

  return (
    <div className="AirdropHistory">
      <div className="flex gap-3">
        {filterLabels.map((label, labelIndex) => (
          <button
            key={`${label}-${labelIndex}`}
            onClick={() => onLabelChange(labelIndex)}
            className={`btn btn-lg !text-xl btn-has-tag btn-${
              label === activeLabel ? 'active' : 'lighter'
            }`}
          >
            {label}
            {/* TODO: show the number of list of each category */}
            <span className="tag">{nameCounts[labelMap[label]]}</span>
          </button>
        ))}
      </div>
      <article className="wrap-list">
        {!historyList ? (
          // TODO: show when there is no list
          <p className="mt-10 text-xl text-center text-primary/20">You have no history yet.</p>
        ) : (
          <div className="list">
            <div className="thead">
              <div className="tr">
                <div className="td">Name</div>
                <div className="td">Score</div>
                <div className="td">Through</div>
                <div className="td">Date</div>
              </div>
            </div>
            <div className="tbody">
              {pagedHistory.map((history) => (
                <div
                  className="tr"
                  key={`${history.id}-${history.name}-${history.score}`}
                  // ref={ }
                >
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {history.name}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      +{history.score}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {history.activity_type}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {history.created_at.toString()}
                    </SkeletonElement>
                  </div>
                </div>
              ))}
            </div>
            {/* 'more' button should be visible only when there are more lists. */}
            {hasMoreHistory && (
              <div className="mt-6 text-center">
                <Button
                  label="More"
                  css="underlined"
                  size="lg"
                  onClick={() => {
                    fetchNextHistory();
                  }}
                />
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
};
