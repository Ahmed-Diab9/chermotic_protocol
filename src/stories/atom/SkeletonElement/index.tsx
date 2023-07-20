import React, { PropsWithChildren } from 'react';
import Skeleton, { SkeletonProps } from 'react-loading-skeleton';

export interface SkeletonElementProps extends SkeletonProps {
  isLoading?: boolean | undefined;
}

export const SkeletonElement = (props: PropsWithChildren<SkeletonElementProps>) => {
  const { isLoading, children, ...skeletonProps } = props;
  return <>{isLoading ? <Skeleton {...skeletonProps}></Skeleton> : children}</>;
};

export const SkeletonCircle = (props: PropsWithChildren<SkeletonElementProps>) => {
  const { isLoading, children, ...skeletonProps } = props;
  return (
    <>
      {isLoading ? (
        <>
          <Skeleton {...skeletonProps} circle></Skeleton>
          <Skeleton {...skeletonProps}></Skeleton>{' '}
        </>
      ) : (
        children
      )}
    </>
  );
};

