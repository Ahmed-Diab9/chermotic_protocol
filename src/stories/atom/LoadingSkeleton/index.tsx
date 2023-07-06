import './style.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

interface LoadingSkeletonProps {
  loading: boolean;
}

export const LoadingSkeleton = (props: LoadingSkeletonProps) => {
  const { loading } = props;

  return <div>{loading ? <Skeleton width={70} /> : 'John Doe'}</div>;
};
