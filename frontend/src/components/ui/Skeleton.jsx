export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse-soft rounded-lg bg-surface2 ${className}`} />
);

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-5/6 mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3">
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);
