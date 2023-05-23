import React, { useState } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components"; // example render components - source below

interface RangeProps {}

const sliderStyle: React.CSSProperties = {
  position: "relative",
  margin: "0",
  width: "100%",
  // margin: "0 10px",
  // width: "calc(100% - 20px)",
};

const domain: [number, number] = [0, 100];
const defaultValues: number[] = [5];

export const Range = ({ ...props }: RangeProps) => {
  const [values, setValues] = useState<number[]>(defaultValues.slice());
  const [update, setUpdate] = useState<number[]>(defaultValues.slice());

  const onUpdate = (newUpdate: number[]) => {
    setUpdate(newUpdate);
  };

  const onChange = (newValues: number[]) => {
    setValues(newValues);
  };

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <Slider
        mode={1}
        step={1}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={onUpdate}
        onChange={onChange}
        values={values}
      >
        <Rail>
          {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="px-[11px] slider-handles">
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
            <div className="px-3 slider-tracks">
              <div className="relative">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            </div>
          )}
        </Tracks>
        <Ticks
          count={4 /* generate approximately 15 ticks within the domain */}
        >
          {({ ticks }) => (
            <div className="px-[11px] slider-ticks">
              <div className="relative">
                {ticks.map((tick) => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  );
};
