import './style.css';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface LoadingSkeletonProps {
  loading: boolean;
}

export const LoadingSkeleton = (props: LoadingSkeletonProps) => {
  const { loading } = props;

  return <div>{loading ? <Skeleton width={70} /> : 'John Doe'}</div>;
};
