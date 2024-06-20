import { Suspense } from "react"
import { getData } from "@/app/lib/controllerAdmin"
import PageTitle from "@/app/components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Bolao } from "@/app/lib/definitions"
import { STYLES_BOX_SHADOW } from "@/app/lib/utils"

async function Admin() {
  const data = await getData()

  return (
    <div>
      <PageTitle center={true}>
        <h1>Admin</h1>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <h2 className="mb-10">Bolões: {data.boloes.length}</h2>

        {data.boloes.map((el: Bolao) => (
          <div key={el.id} className={STYLES_BOX_SHADOW}>
            <h3 className="text-1xl capitalize mb-4">{el.name}</h3>
            <div>Competition id: {el.competition_id}</div>
            <div>Id: ****{el.id.slice(-5)}</div>
          </div>
        ))}
      </Suspense>
    </div>
  )
}

export default Admin
