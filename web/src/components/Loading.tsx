export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-tamkeen-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function GameCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <LoadingSkeleton className="h-5 w-28" />
          <LoadingSkeleton className="h-5 w-28" />
        </div>
        <div className="text-right space-y-2">
          <LoadingSkeleton className="h-6 w-8" />
          <LoadingSkeleton className="h-6 w-8" />
        </div>
      </div>
    </div>
  )
}

export function StandingsRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="h-6 w-6 rounded-full" />
        <LoadingSkeleton className="h-5 w-32" />
      </div>
      <LoadingSkeleton className="h-5 w-16" />
    </div>
  )
}

export function PlayerRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="h-6 w-6 rounded-full" />
        <div className="space-y-1">
          <LoadingSkeleton className="h-4 w-28" />
          <LoadingSkeleton className="h-3 w-20" />
        </div>
      </div>
      <LoadingSkeleton className="h-5 w-12" />
    </div>
  )
}
