import React from 'react';
import {
  Slider as CompoundSlider,
  Rail,
  Handles,
  Tracks,
  Ticks,
  TicksProps,
} from 'react-compound-slider';
import { SliderRail, Handle, Track, Tick } from './components'; // example render components - source below
import { fixFloatMath } from '~/utils/number';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  tick?: number | number[];
  value?: number | string;
  onChange?: (newValue: number) => unknown;
  onUpdate?: (newValue: number) => unknown;
  readonly?: boolean;
}

const sliderStyle: React.CSSProperties = {
  position: 'relative',
  margin: '0 10px 0 8px',
  width: 'calc(100%-18px)',
  zIndex: 0,
};

export const Slider = ({
  min = 0,
  max = 100,
  step = 0.01,
  tick = 1,
  value = 0,
  onChange,
  onUpdate,
  readonly = false,
}: SliderProps) => {
  const domain: [number, number] = [min, max];

  const handleSetter = (setter?: (newValue: number) => unknown) => (values: readonly number[]) => {
    if (!setter) return;
    if (values.length > 1) {
      console.warn('[Range]: single value only');
    }
    setter(fixFloatMath(values[0]));
  };

  const ticksProps: Omit<TicksProps, 'children'> =
    typeof tick === 'number'
      ? {
          count: tick,
        }
      : {
          values: tick,
        };

  return (
    <div className="w-full h-auto">
      <CompoundSlider
        mode={1}
        step={step}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={handleSetter(onUpdate)}
        onChange={handleSetter(onChange)}
        values={value ? [fixFloatMath(+value)] : []}
        disabled={readonly}
      >
        <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              <div className="relative">
                {handles.map((handle) => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            </div>
          )}
        </Handles>
        <Tracks right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              <div className="relative">
                {tracks.map(({ id, source, target }) => (
                  <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                ))}
              </div>
            </div>
          )}
        </Tracks>
        <Ticks {...ticksProps}>
          {({ ticks }) => (
            <div className="slider-ticks">
              <div className="relative">
                {ticks.map((tick) => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            </div>
          )}
        </Ticks>
      </CompoundSlider>
    </div>
  );
};
