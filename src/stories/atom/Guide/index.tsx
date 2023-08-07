import { useState } from 'react';
import { Outlink } from '../Outlink';
import { Button } from '~/stories/atom/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BellIcon } from '@heroicons/react/24/outline';

interface GuideProps {
  title: string;
  paragraph: string;
  outLink?: string;
  outLinkAbout?: string;
  flex?: boolean;
  onClick?: () => unknown;
}

export const Guide = (props: GuideProps) => {
  const { title, paragraph, outLink, outLinkAbout, flex } = props;

  const [guideVisible, setGuideVisible] = useState(true);
  const closeGuide = () => {
    setGuideVisible(false);
  };

  return (
    <>
      {guideVisible && (
        <div
          className={`relative px-5 text-left rounded-xl bg-light2/20 dark:bg-dark2/20 ${
            flex ? 'flex gap-4 py-2 !pr-12' : 'py-4'
          }`}
        >
          <div className="flex items-center gap-1">
            <BellIcon className="w-4" />
            {/* <InformationCircleIcon className="w-4" /> */}
            <p className="whitespace-nowrap">{title}</p>
          </div>
          <p className="my-2 text-sm text-black3 dark:text-white3">{paragraph}</p>
          {outLink && <Outlink outLink={outLink} outLinkAbout={outLinkAbout} />}
          {/* todo: 버튼 누르면 닫힘 */}
          <Button
            iconOnly={<XMarkIcon />}
            css="unstyled"
            className="absolute top-1 right-1 text-black3 dark:text-white3"
            onClick={closeGuide}
          />
        </div>
      )}
    </>
  );
};
