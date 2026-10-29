export default function MatchesSkeleton() {
  return (
    <div aria-hidden="true" className="mb-8 grid animate-pulse gap-4 md:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <div key={index} className="h-64 rounded-xl border bg-muted/50" />
      ))}
    </div>
  )
}
