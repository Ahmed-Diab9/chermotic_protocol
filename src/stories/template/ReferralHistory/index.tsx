import { Button } from '~/stories/atom/Button';
import '~/stories/atom/Button/style.css';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { EpochTooltip } from '~/stories/atom/EpochTooltip';
import { Tag } from '~/stories/atom/Tag';

import './style.css';

interface ReferralHistoryProps {}

export const ReferralHistory = (props: ReferralHistoryProps) => {
  let epochId = 1;

  return (
    <div className="ReferralHistory">
      <div className="flex gap-3">
        <button
          // key={`${label}-${labelIndex}`}
          // onClick={() => onLabelChange(labelIndex)}
          className={`btn btn-lg !text-xl btn-has-tag btn-active`}
        >
          As Referrer
        </button>
        <button
          // key={`${label}-${labelIndex}`}
          // onClick={() => onLabelChange(labelIndex)}
          className={`btn btn-lg !text-xl btn-has-tag btn-lighter`}
        >
          As Trader
        </button>
      </div>
      <div className="flex items-center justify-between gap-5 py-5 mt-5 border-y">
        <h3 className="text-primary-light">As Referrer, you earned...</h3>
        <h3>
          621.25 <span className="text-lg font-semibold">rCHRMA</span>
        </h3>
      </div>
      <article className="mt-8 wrap-list">
        {/* if there is no list (empty) */}
        {/* <p className="mt-10 text-xl text-center text-primary/20">You have no history yet.</p> */}

        {/* if there is list */}
        <div className="list">
          <div className="thead">
            <div className="tr">
              <div className="td">Epoch</div>
              <div className="td">My Tier</div>
              <div className="td">Total Trading Fee</div>
              <div className="td">Your Rebate Rewards</div>
            </div>
          </div>
          <div className="tbody">
            <div
              className="tr"
              // ref={ }
            >
              <div className="td">
                <SkeletonElement
                  // isLoading={isLoading}
                  width={40}
                >
                  <Tag
                    label={`#${epochId}`}
                    css="default"
                    className={`tooltip-epoch-${epochId} cursor-default`}
                  />
                </SkeletonElement>
                <EpochTooltip epochId={epochId} />
              </div>
              <div className="td">
                <SkeletonElement
                  // isLoading={isLoading}
                  width={40}
                >
                  <Tag label="Tier 1" css="leverage" />
                </SkeletonElement>
              </div>
              <div className="td">
                <SkeletonElement
                  // isLoading={isLoading}
                  width={40}
                >
                  <h4 className="value">
                    0.00 <span>USD</span>
                  </h4>
                </SkeletonElement>
              </div>
              <div className="td">
                <SkeletonElement
                  // isLoading={isLoading}
                  width={40}
                >
                  <h4 className="value">
                    0.00 <span>rCHRMA</span>
                  </h4>
                </SkeletonElement>
              </div>
            </div>
          </div>
          {/* 'more' button should be visible only when there are more lists. */}
          <div className="mt-6 text-center">
            <Button label="More" css="underlined" size="lg" onClick={() => {}} />
          </div>
        </div>
      </article>
    </div>
  );
};
