import PropTypes from "prop-types";
import "./style.css";

interface ProgressProps {
  value?: number;
  max?: number;
  css?: "default" | "sm";
}

export const Progress = (props: ProgressProps) => {
  const { value, max, css = "default" } = props;
  const progressPercentage = (value / max) * 100;

  return (
    <div
      className={`progress progress-${css} w-full h-1 overflow-hidden rounded bg-gray`}
    >
      <div
        className={`h-full bg-black rounded w-[${progressPercentage}%]`}
      ></div>
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};
