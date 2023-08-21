import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

interface OutlinkProps {
  label?: string;
  outLink: string;
  outLinkAbout?: string;
  className?: string;
  onClick?: () => unknown;
}

export const Outlink = (props: OutlinkProps) => {
  const { label = 'Learn more', outLink, outLinkAbout, className = '' } = props;

  return (
    <a
      href={outLink}
      className={`inline-flex hover:underline cursor-pointer text-primary-light ${className}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="self-center text-sm font-semibold">
        <p className="inline">
          {label}
          {outLinkAbout && ` about "${outLinkAbout}"`}
        </p>
        <ArrowUpRightIcon className="inline w-3 ml-1" />
      </div>
    </a>
  );
};
