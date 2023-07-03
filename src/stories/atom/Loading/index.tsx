import './style.css';

interface LoadingProps {
  color?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
}

export const Loading = (props: LoadingProps) => {
  const { color, size = 'xs' } = props;

  return (
    <div className={`loading loading-${size} text-${color} animate-spin`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          className="fill-current"
          fill-rule="evenodd"
          d="M12 6a6 6 0 1 1-6-6v1.3A4.7 4.7 0 1 0 10.7 6H12Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  );
};
