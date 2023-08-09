import React, { Fragment } from 'react';
import { GetHandleProps, GetRailProps, GetTrackProps, SliderItem } from 'react-compound-slider';

const railOuterStyle = {
  position: 'absolute',
  width: '100%',
  height: 18,
  transform: 'translate(0%, -50%)',
  // borderRadius: 7,
  cursor: 'pointer',
};

// background line
const railInnerStyle = {
  position: 'absolute' as React.CSSProperties['position'],
  width: 'calc(100% + 18px)',
  height: 18,
  marginLeft: '-8px',
  transform: 'translate(0%, -50%)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: 20,
  pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
};

export function SliderRail({ getRailProps }: { getRailProps: GetRailProps }) {
  return (
    <Fragment>
      <div style={railOuterStyle} {...getRailProps()} />
      <div style={railInnerStyle} className="bg-paper border-gray-light" />
    </Fragment>
  );
}

interface HandleProps {
  domain: [number, number];
  handle: SliderItem;
  disabled?: boolean;
  getHandleProps: GetHandleProps;
}
export function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
}: HandleProps) {
  return (
    <Fragment>
      <div
        style={{
          left: `${percent}%`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          WebkitTapHighlightColor: 'rgba(0,0,0,0)',
          zIndex: 5,
          width: 28,
          height: 42,
          cursor: 'pointer',
          backgroundColor: 'none',
        }}
        {...getHandleProps(id)}
      />
      {/* handle: selected point */}
      <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          left: `${percent}%`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          marginLeft: 1,
          zIndex: 2,
          width: percent === 0 ? 8 : 6,
          height: percent === 0 ? 8 : 6,
          borderRadius: '50%',
          boxSizing: 'content-box',
          borderStyle: 'solid',
          boxShadow: percent === 0 ? '1px 1px 4px rgba(163, 163, 163, 0.25)' : undefined,
        }}
        className={`${disabled ? 'bg-gray-dark' : 'bg-paper'} ${
          percent === 0 ? 'border border-gray-light' : 'border-2 border-primary'
        }`}
      />
    </Fragment>
  );
}

interface TrackProps {
  source: SliderItem;
  target: SliderItem;
  getTrackProps: GetTrackProps;
  disabled?: boolean;
}
export function Track({ source, target, getTrackProps, disabled = false }: TrackProps) {
  return (
    // active line
    <div className="relative">
      <div className="px-1">
        <div
          style={{
            position: 'absolute',
            transform: 'translate(-6px, -50%)',
            height: 10,
            zIndex: 1,
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            left: `calc(${source.percent}% + 2px)`,
            width: `calc(${target.percent - source.percent}% + 4px)`,
            opacity: target.percent === 0 && 0,
          }}
          className={disabled ? 'bg-gray-lighter' : 'bg-primary'}
          {...getTrackProps()}
        />
      </div>
    </div>
  );
}

interface TickProps {
  tick: SliderItem;
  count: number;
  format?: (v: number) => number;
}
export function Tick({ tick, count, format = (v) => v }: TickProps) {
  return (
    <div>
      {/* Tick - dot */}
      <div
        style={{
          position: 'absolute',
          marginTop: -1,
          width: 2,
          height: 2,
          borderRadius: 2,
          left: `${tick.percent}%`,
        }}
        className="bg-gray-light"
      />
      {/* Tick - number */}
      <button
        // todo: 누르면 해당값이 들어가도록
        // onClick={}
        style={{
          position: 'absolute',
          marginTop: 12,
          fontSize: 10,
          textAlign: 'center',
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`,
        }}
      >
        {format(tick.value)}
      </button>
    </div>
  );
}
