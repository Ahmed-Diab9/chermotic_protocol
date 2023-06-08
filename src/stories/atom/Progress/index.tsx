import PropTypes from "prop-types";

interface ProgressProps {
  value?: number;
  max?: number;
}

export const Progress = (props: ProgressProps) => {
  const { value, max } = props;
  const progressPercentage = (value / max) * 100;

  return (
    <div className="w-full h-1 overflow-hidden rounded bg-gray">
      <div
        className="h-full bg-black rounded"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};
