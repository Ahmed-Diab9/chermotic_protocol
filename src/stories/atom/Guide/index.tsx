import { Button } from "~/stories/atom/Button";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { BellIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface GuideProps {
  title?: string;
  paragraph?: string;
  outLink?: string;
  outLinkAbout?: string;
  flex?: boolean;
  className?: string;
  onClick?: () => unknown;
}

export const Guide = (props: GuideProps) => {
  const {
    title,
    paragraph,
    outLink,
    outLinkAbout,
    flex,
    // className,
  } = props;

  return (
    <div
      className={`relative px-5 text-left rounded-xl bg-gray/20 ${
        flex ? "flex gap-4 py-2" : "pt-4 pb-5"
      }`}
    >
      <div className="flex items-center gap-1">
        {/* <BellIcon className="w-4" /> */}
        <InformationCircleIcon className="w-4" />
        <p>{title}</p>
      </div>
      <p className="my-2 text-sm text-black/30">{paragraph}</p>
      {outLink && (
        <a
          href={outLink}
          className="inline-flex"
          target="_blank"
          rel="noreferrer"
        >
          <div className="flex items-center gap-1 text-sm font-semibold text-black/50">
            Learn more
            {outLinkAbout && ` about "${outLinkAbout}"`}
            <ArrowUpRightIcon className="w-3 ml-1" />
          </div>
        </a>
      )}
      {/* todo: 버튼 누르면 닫힘 */}
      <Button
        iconOnly={<XMarkIcon />}
        css="unstyled"
        className="absolute top-1 right-1 text-black/30"
      />
    </div>
  );
};
