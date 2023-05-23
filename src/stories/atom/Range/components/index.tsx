import React, { Fragment } from "react";
import PropTypes from "prop-types";
import {
  GetHandleProps,
  GetRailProps,
  GetTrackProps,
} from "react-compound-slider";

// *******************************************************
// RAIL
// *******************************************************
// 생략
const railOuterStyle = {
  position: "absolute",
  width: "100%",
  height: 42,
  transform: "translate(0%, -50%)",
  borderRadius: 7,
  cursor: "pointer",
};

// background line
const railInnerStyle = {
  position: "absolute" as React.CSSProperties["position"],
  width: "100%",
  height: 20,
  transform: "translate(0%, -50%)",
  backgroundColor: "#ffffff",
  border: "1px solid #d4d4d4",
  borderRadius: 20,
  pointerEvents: "none" as React.CSSProperties["pointerEvents"],
};

export function SliderRail({ getRailProps }: { getRailProps: GetRailProps }) {
  return (
    <Fragment>
      <div style={railOuterStyle} {...getRailProps()} />
      <div style={railInnerStyle} />
    </Fragment>
  );
}

SliderRail.propTypes = {
  getRailProps: PropTypes.func.isRequired,
};

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
interface HandleProps {
  domain: [number, number];
  handle: {
    id: string;
    value: number;
    percent: number;
  };
  disabled: boolean;
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
          position: "absolute",
          transform: "translate(-50%, -50%)",
          WebkitTapHighlightColor: "rgba(0,0,0,0)",
          zIndex: 5,
          width: 28,
          height: 42,
          cursor: "pointer",
          // border: '1px solid white',
          backgroundColor: "none",
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
          position: "absolute",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          width: 8,
          height: 8,
          borderRadius: "50%",
          boxSizing: "content-box",
          border: percent === 0 ? "1px solid #D4D4D4" : "2px solid black",
          backgroundColor: disabled ? "#666" : "#ffffff",
          boxShadow: "1px 1px 4px rgba(163, 163, 163, 0.25)",
        }}
      />
    </Fragment>
  );
}

Handle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Handle.defaultProps = {
  disabled: false,
};

// *******************************************************
// KEYBOARD HANDLE COMPONENT
// Uses a button to allow keyboard events
// *******************************************************
interface KeyboardHandleProps {
  domain: [number, number];
  handle: { id: string; value: number; percent: number };
  disabled: boolean;
  getHandleProps: GetHandleProps;
}
export function KeyboardHandle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled,
  getHandleProps,
}: KeyboardHandleProps) {
  return (
    <button
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        left: `${percent}%`,
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        width: 24,
        height: 24,
        borderRadius: "50%",
        boxShadow: "1px 1px 1px 1px rgba(0, 0, 0, 0.3)",
        backgroundColor: disabled ? "#666" : "#ffc400",
      }}
      {...getHandleProps(id)}
    />
  );
}

KeyboardHandle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

KeyboardHandle.defaultProps = {
  disabled: false,
};

// *******************************************************
// TRACK COMPONENT
// *******************************************************
interface TrackProps {
  source: {
    id: string;
    value: number;
    percent: number;
  };
  target: {
    id: string;
    value: number;
    percent: number;
  };
  getTrackProps: GetTrackProps;
  disabled: boolean;
}
export function Track({ source, target, getTrackProps, disabled }: TrackProps) {
  return (
    // active line
    <div className="relative">
      <div className="px-1">
        <div
          style={{
            position: "absolute",
            transform: "translate(-8px, -50%)",
            height: 12,
            zIndex: 1,
            backgroundColor: disabled ? "#999" : "#030303",
            borderRadius: "8px 0 0 8px",
            cursor: "pointer",
            left: `${source.percent}%`,
            width: `calc(${target.percent - source.percent}% + 8px)`,
            opacity: target.percent === 0 && 0,
          }}
          {...getTrackProps()}
        />
      </div>
    </div>
  );
}

Track.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Track.defaultProps = {
  disabled: false,
};

// *******************************************************
// TICK COMPONENT
// *******************************************************
interface TickProps {
  tick: {
    id: string;
    value: number;
    percent: number;
  };
  count: number;
  format: (v: number) => number;
}
export function Tick({ tick, count, format }: TickProps) {
  return (
    <div>
      {/* Tick - dot */}
      <div
        // className={`absolute mt-[-1px] w-[2px] h-[2px] rounded bg-[#D4D4D4] left-[${tick.percent}%]`}
        className=""
        style={{
          position: "absolute",
          marginTop: -1,
          width: 2,
          height: 2,
          borderRadius: 2,
          backgroundColor: "#D4D4D4",
          left: `${tick.percent}%`,
        }}
      />
      {/* Tick - number */}
      <div
        style={{
          position: "absolute",
          marginTop: 12,
          fontSize: 10,
          textAlign: "center",
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`,
        }}
      >
        {format(tick.value)}
      </div>
    </div>
  );
}

Tick.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
  }).isRequired,
  count: PropTypes.number.isRequired,
  format: PropTypes.func.isRequired,
};

Tick.defaultProps = {
  format: (d: number) => d,
};
