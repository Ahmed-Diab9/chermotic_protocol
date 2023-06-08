import { isValid } from "~/utils/valid";
import "./style.css";

interface ProgressProps {
  value?: number;
  max?: number;
  css?: "default" | "sm";
}

export const Progress = (props: ProgressProps) => {
  const { value, max, css = "default" } = props;
  const progressPercent =
    isValid(value) && isValid(max) ? (value / max) * 100 : 0;

  return (
    <div
      className={`progress progress-${css} w-full h-1 overflow-hidden rounded bg-gray`}
    >
      <div
        className={`h-full bg-black rounded`}
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>
  );
};
