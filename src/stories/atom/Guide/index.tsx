import { useState } from 'react';
import { Outlink } from '../Outlink';
import { Button } from '~/stories/atom/Button';
import { XMarkIcon, BellIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {} from '@heroicons/react/24/outline';

interface GuideProps {
  title: string;
  paragraph: string;
  outLink?: string;
  outLinkAbout?: string;
  direction?: 'row' | 'column';
  className?: string;
  onClick?: () => unknown;
}

export const Guide = (props: GuideProps) => {
  const { title, paragraph, outLink, outLinkAbout, direction = 'column', className } = props;

  const [guideVisible, setGuideVisible] = useState(true);
  const closeGuide = () => {
    setGuideVisible(false);
  };

  return (
    <>
      {guideVisible && (
        <div
          className={`relative px-5 text-left rounded-xl bg-paper-light flex gap-3 ${
            direction === 'row' ? 'py-2 items-center' : 'py-4'
          } ${className}`}
        >
          <div>
            {/* <BellIcon className="w-4" /> */}
            <ExclamationTriangleIcon className="w-4" />
          </div>
          <div className={`flex ${direction === 'row' ? 'gap-4 !pr-12' : 'gap-2 flex-col'}`}>
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap">{title}</p>
            </div>
            <p className="text-sm text-primary-lighter">{paragraph}</p>
            {outLink && (
              <div className="mt-2">
                <Outlink outLink={outLink} outLinkAbout={outLinkAbout} />
              </div>
            )}

            <Button
              iconOnly={<XMarkIcon />}
              css="unstyled"
              className={`absolute right-1 text-primary-lighter  ${
                direction === 'row' ? '' : 'top-1'
              }`}
              onClick={closeGuide}
            />
          </div>
        </div>
      )}
    </>
  );
};
