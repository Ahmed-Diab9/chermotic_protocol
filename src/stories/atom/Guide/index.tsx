import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '../Outlink';

interface GuideProps {
  title: string;
  paragraph?: string;
  outLink?: string;
  outLinkAbout?: string;
  direction?: 'row' | 'column';
  css?: 'default' | 'alert';
  className?: string;
  isVisible?: boolean;
  isClosable?: boolean;
  onClick?: () => unknown;
}

export const Guide = (props: GuideProps) => {
  const {
    title,
    paragraph,
    outLink,
    outLinkAbout,
    direction = 'column',
    css = 'default',
    className,
    onClick,
    isVisible,
    isClosable = true,
  } = props;

  return (
    <>
      {isVisible && (
        <div
          className={`relative px-5 text-left rounded flex gap-3 ${
            direction === 'row' ? 'py-2 items-center' : 'py-4'
          } ${className} ${
            css === 'alert' ? 'bg-price-lower/10 text-price-lower' : 'bg-paper-light'
          }`}
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

            {isClosable && (
              <Button
                iconOnly={<XMarkIcon />}
                css="unstyled"
                className={`absolute right-1 text-primary-lighter  ${
                  direction === 'row' ? 'top-0' : 'top-1'
                }`}
                onClick={onClick}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
