import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({
  variant = 'rect',
  className = '',
  ...props
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-white/[0.04] border border-white/[0.03]';
  
  const variants = {
    text: 'h-4 w-full rounded-md',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-4">
      <Skeleton variant="rect" className="h-44 w-full" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton variant="text" className="h-6 w-2/3" />
        <Skeleton variant="text" className="h-5 w-1/5" />
      </div>
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-5/6" />
      <div className="flex gap-2 mt-2">
        <Skeleton variant="rect" className="h-8 w-20" />
        <Skeleton variant="rect" className="h-8 w-20" />
      </div>
    </div>
  );
}
