import "./style.css";

interface LoadingProps {
  color?: string;
  size?: "xs" | "sm" | "base" | "lg";
}

export const Loading = (props: LoadingProps) => {
  const { color, size = "xs" } = props;

  return (
    <div className={`loading loading-${size} text-${color}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="25"
        fill="none"
        viewBox="0 0 24 25"
      >
        <g clipPath="url(#a)">
          <path
            className="fill-current"
            d="M11.016 24.5c-3.14-.27-5.761-1.552-7.863-3.844C1.05 18.363 0 15.648 0 12.51c0-3.151 1.051-5.868 3.153-8.15C5.255 2.078 7.876.798 11.016.52v2.275c-2.5.265-4.592 1.318-6.275 3.159-1.683 1.84-2.525 4.025-2.525 6.556 0 2.53.842 4.719 2.525 6.566 1.683 1.846 3.774 2.896 6.275 3.149V24.5Zm2.07 0v-2.275c2.295-.202 4.246-1.123 5.855-2.763 1.61-1.64 2.557-3.611 2.843-5.913H24c-.232 2.952-1.374 5.462-3.424 7.53-2.051 2.07-4.548 3.21-7.49 3.421Zm8.698-13.029c-.257-2.302-1.195-4.273-2.815-5.913-1.62-1.64-3.58-2.568-5.883-2.783V.5c2.937.225 5.433 1.37 7.486 3.434S23.768 8.51 24 11.47h-2.216Z"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path className="fill-current" d="M0 0h24v24H0z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
