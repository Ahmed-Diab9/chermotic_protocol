import { Button } from '~/stories/atom/Button';
import '~/stories/atom/Button/style.css';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';

import { useAirdropBoard } from './hooks';
import './style.css';

export const AirdropBoard = () => {
  const {
    filterLabels,
    creditLabel,
    labelMap,
    activeLabel,
    leaderboard,
    hasMoreLeaderBoard,
    onLabelChange,
    fetchNextLeaderBoard,
  } = useAirdropBoard();

  return (
    <div className="AirdropBoard">
      <div className="flex gap-3">
        {filterLabels.map((label, labelIndex) => (
          <button
            key={`${label}-${labelIndex}`}
            onClick={() => onLabelChange(labelIndex)}
            className={`btn btn-lg !text-xl btn-has-tag btn-${
              activeLabel === labelMap[label] ? 'active' : 'lighter'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <article className="mt-7 wrap-list">
        {!leaderboard ? (
          <p className="mt-10 text-xl text-center text-primary/20">You have no history yet.</p>
        ) : (
          <div className="list">
            <div className="thead">
              <div className="tr">
                <div className="td">Rank</div>
                <div className="td">Name</div>
                <div className="td">
                  <span>{creditLabel}</span>
                </div>
                <div className="td">Boosters</div>
              </div>
            </div>
            <div className="tbody">
              {leaderboard.map((boardItem) => (
                <div
                  className="tr"
                  key={`${boardItem.address}-${boardItem.rank}`}
                  // ref={ }
                >
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      <Tag label={`#${boardItem.rank}`} className="text-xl bg-primary/10" />
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {boardItem.address}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {boardItem.credit}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {boardItem.booster}
                    </SkeletonElement>
                  </div>
                </div>
              ))}
            </div>
            {/* 'more' button should be visible only when there are more lists. */}
            {hasMoreLeaderBoard && (
              <div className="mt-6 text-center">
                <Button
                  label="More"
                  css="underlined"
                  size="lg"
                  onClick={() => {
                    fetchNextLeaderBoard();
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
