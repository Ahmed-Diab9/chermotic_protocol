import './style.css';

interface LoadingProps {
  color?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
}

export const Loading = (props: LoadingProps) => {
  const { color, size = 'sm' } = props;

  return (
    <div className={`loading loading-${size} text-${color} animate-spin`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 16 16"
      >
        <g clip-path="url(#a)">
          <path
            className="fill-current"
            fill-rule="evenodd"
            d="M13.35 8c.359 0 .654.292.615.649a6 6 0 1 1-6.614-6.614c.357-.039.649.256.649.615s-.293.645-.648.694a4.701 4.701 0 1 0 5.304 5.304c.049-.355.335-.648.694-.648Z"
            clip-rule="evenodd"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h16v16H0z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
