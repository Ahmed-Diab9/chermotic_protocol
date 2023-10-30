import { useState } from 'react';
import '~/stories/atom/Button/style.css';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';

import './style.css';

const historyList = [
  { category: 'Credits', score: '30', through: 'Zealy', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Booster', score: '20', through: 'Galxe NFT', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Booster', score: '20', through: 'Galxe NFT', date: '2023/10/04 08:24:37 (UTC)' },
  { category: 'Credits', score: '30', through: 'Zealy', date: '2023/10/04 08:24:37 (UTC)' },
];

export const AirdropHistory = () => {
  const [activeButton, setActiveButton] = useState('All');
  const categories = ['All', 'Credits', 'Booster'];
  const filteredContent =
    activeButton === 'All'
      ? historyList
      : historyList.filter((item) => item.category === activeButton);

  return (
    <div className="AirdropHistory">
      <div className="flex gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveButton(category)}
            className={`btn btn-lg !text-xl btn-has-tag btn-${
              activeButton === category ? 'active' : 'lighter'
            }`}
          >
            {category}
            {/* TODO: show the number of list of each category */}
            <span className="tag">2</span>
          </button>
        ))}
      </div>
      <article className="mt-7">
        {!historyList ? (
          <p className="mt-10 text-center text-primary/20">You have no history yet.</p>
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
              {filteredContent.map((history) => (
                <div
                  className="tr"
                  // ref={ }
                >
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {history.category}
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
                      {history.through}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {history.date}
                    </SkeletonElement>
                  </div>
                </div>
              ))}
            </div>
            {/* 'more' button should be visible only when there are more lists. */}
            <div className="mt-6 text-center">
              <Button label="More" css="underlined" size="lg" />
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
