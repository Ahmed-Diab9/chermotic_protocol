import { ScrollTrigger } from '~/stories/atom/ScrollTrigger';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';

import { useLiquidityItems } from './hooks';

export function LiquidityItems() {
  const {
    isScrollTriggerVisible,
    isScrollTriggerHasOpacity,
    onScrollLiquidityWrapper,

    liquidityItems,
  } = useLiquidityItems();

  return (
    <>
      <div
        id="bins"
        className="max-h-[calc(100vh-600px)] min-h-[180px] overflow-auto"
        onScroll={onScrollLiquidityWrapper}
      >
        {liquidityItems.map(({ key, ...props }) => (
          <LiquidityItem key={key} {...props} />
        ))}
      </div>
      <div className="absolute bottom-0 flex justify-center w-full">
        <ScrollTrigger isVisible={isScrollTriggerVisible} hasOpacity={isScrollTriggerHasOpacity} />
      </div>
    </>
  );
}
