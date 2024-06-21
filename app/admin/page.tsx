import { Suspense } from "react"
import { getData } from "@/app/lib/controllerAdmin"
import PageTitle from "@/app/components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Bolao } from "@/app/lib/definitions"
import AdminBolao from "@/app/components/adminBolao"

async function Admin() {
  const data = await getData()

  return (
    <div>
      <PageTitle center={true}>
        <h1>Admin</h1>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <h2 className="mb-10">All Bolões: {data.boloes.length}</h2>

        {data.boloes.map((el: Bolao) => {
          return <AdminBolao key={el.id} bolao={el} />
        })}
      </Suspense>
    </div>
  )
}

export default Admin
