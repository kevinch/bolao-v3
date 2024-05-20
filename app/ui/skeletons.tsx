function BoloesListSkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-100 p-4 mb-6 shadow">
      <div className="h-6 w-40 rounded-md bg-gray-200 mb-4" />
      <div className="flex justify-between">
        <div className="space-x-4">
          <div className="h-6 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function BoloesListSkeleton() {
  return (
    <div>
      <BoloesListSkeletonCard />
      <BoloesListSkeletonCard />
      <BoloesListSkeletonCard />
    </div>
  )
}

export function PaginationSkeleton() {
  return (
    <div className="animate-pulse mb-6 flex justify-center">
      <div className="h-6 w-40 rounded-md bg-gray-200 " />
    </div>
  )
}

function TableMatchDayResultsLineSkeleton() {
  return <div className="h-6 rounded-md bg-gray-200 mb-4 " />
}

export function TableMatchDayResultsSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 p-4 mb-6 shadow">
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
      <TableMatchDayResultsLineSkeleton />
    </div>
  )
}
