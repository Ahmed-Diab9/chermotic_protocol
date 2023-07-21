import './style.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface LoadingSkeletonProps {
  isLoading: boolean;
}

export const LoadingSkeleton = (props: LoadingSkeletonProps) => {
  const { isLoading } = props;

  return <div>{isLoading ? <Skeleton width={70} /> : 'John Doe'}</div>;
};
