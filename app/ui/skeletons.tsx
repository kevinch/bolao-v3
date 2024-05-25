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

function PaginationSkeleton() {
  return (
    <div className="animate-pulse mb-10 flex justify-center">
      <div className="h-6 w-40 rounded-md bg-gray-200 " />
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="animate-pulse mb-10 flex justify-center">
      <div className="h-6 w-1/4  bg-gray-200 " />
      <div className="h-6 w-1/4  bg-gray-200 " />
      <div className="h-6 w-1/4  bg-gray-200 " />
      <div className="h-6 w-1/4  bg-gray-200 " />
    </div>
  )
}

function PageTitleSkeleton() {
  return (
    <div className="animate-pulse mt-24 mb-20 flex items-center flex-col">
      <div className="h-20 w-20 rounded-full bg-gray-200 mb-6" />
      <div className="h-10 w-80 rounded-md bg-gray-200 mb-2" />
      <div className="h-4 w-20 rounded-md bg-gray-200 " />
    </div>
  )
}

function TableLineSkeleton() {
  return <div className="h-6 rounded-md bg-gray-200 mb-4 " />
}

export function BolaoPagesSkeleton() {
  return (
    <>
      <PageTitleSkeleton />

      <TabsSkeleton />

      <PaginationSkeleton />

      <div className="animate-pulse bg-gray-100 p-4 shadow">
        <TableLineSkeleton />
        <TableLineSkeleton />
        <TableLineSkeleton />
        <TableLineSkeleton />
        <TableLineSkeleton />
        <TableLineSkeleton />
        <TableLineSkeleton />
      </div>
    </>
  )
}
