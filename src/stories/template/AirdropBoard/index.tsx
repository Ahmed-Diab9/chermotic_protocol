import { useState } from 'react';
import '~/stories/atom/Button/style.css';
import { Tag } from '~/stories/atom/Tag';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';

import './style.css';

const boardList = [
  { rank: '1', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
  { rank: '2', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
  { rank: '3', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
  { rank: '4', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
  { rank: '5', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
  { rank: '6', name: '10FCR4A', credit24hour: '242', credit: '242424', booster: '10' },
];

export const AirdropBoard = () => {
  const [activeButton, setActiveButton] = useState('Today');
  const categories = ['Today', 'Yesterday', 'All Time'];

  return (
    <div className="AirdropBoard">
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
          </button>
        ))}
      </div>
      <article className="mt-7">
        {!boardList ? (
          <p className="mt-10 text-center text-primary/20">You have no history yet.</p>
        ) : (
          <div className="list">
            <div className="thead">
              <div className="tr">
                <div className="td">Rank</div>
                <div className="td">Name</div>
                <div className="td">Credits (1D)</div>
                <div className="td">Credits (All Time)</div>
                <div className="td">Boosters</div>
              </div>
            </div>
            <div className="tbody">
              {boardList.map((item) => (
                <div
                  className="tr panel panel-translucent"
                  // ref={ }
                >
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      <Tag label={`#${item.rank}`} className="text-xl bg-primary/10" />
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {item.name}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {item.credit24hour}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {item.credit}
                    </SkeletonElement>
                  </div>
                  <div className="td">
                    <SkeletonElement
                      // isLoading={isLoading}
                      width={40}
                    >
                      {item.booster}
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
