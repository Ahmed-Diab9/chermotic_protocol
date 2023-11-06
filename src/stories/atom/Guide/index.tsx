import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '../Outlink';
import './style.css';

interface GuideProps {
  title: string;
  paragraph?: string;
  outLink?: string;
  outLinkAbout?: string;
  direction?: 'row' | 'column';
  css?: 'default' | 'alert';
  padding?: 'sm' | 'base' | 'lg';
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
    padding = 'base',
    className,
    onClick,
    isVisible,
    isClosable = true,
  } = props;

  return (
    <>
      {isVisible && (
        <div
          className={`relative text-left rounded flex gap-3 ${
            direction === 'row' ? 'py-2 items-center' : 'py-4'
          } ${
            css === 'alert' ? 'bg-price-lower/10 text-price-lower' : 'bg-paper-light'
          } ${className} guide guide-p-${padding}`}
        >
          <div>
            {/* <BellIcon className="w-4" /> */}
            <ExclamationTriangleIcon className="w-4" />
          </div>
          <div
            className={`flex ${
              direction === 'row' ? 'flex-auto gap-4 items-center' : 'gap-2 flex-col'
            }`}
          >
            <div className="flex items-center gap-1">
              <p className="whitespace-nowrap">{title}</p>
            </div>
            <p className="text-sm text-primary-lighter">{paragraph}</p>
            {outLink && (
              <div
                className={`${direction === 'row' ? '' : 'mt-2'} ${
                  isClosable === false ? 'ml-auto' : ''
                }`}
              >
                <Outlink
                  outLink={outLink}
                  outLinkAbout={outLinkAbout}
                  className={`${css === 'alert' ? '!text-primary-lighter' : ''}`}
                />
              </div>
            )}

            {isClosable && (
              <div className="pl-12">
                <Button
                  iconOnly={<XMarkIcon />}
                  css="unstyled"
                  className={`absolute btn-x text-primary-lighter  ${
                    direction === 'row' ? 'top-0' : 'top-1'
                  }`}
                  onClick={onClick}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
