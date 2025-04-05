import { Suspense } from "react"
import { getData } from "@/app/lib/controllerAdmin"
import PageTitle from "@/app/components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Bolao } from "@/app/lib/definitions"
import AdminBolao from "@/app/components/adminBolao"
import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { navigate } from "@/app/lib/actions"

async function Admin() {
  const user = await currentUser()

  if (user) {
    const client = await clerkClient()
    const userData = await client.users.getUser(user.id)
    const role = userData.privateMetadata?.role || "guest"

    if (role !== "admin") {
      return navigate("/")
    }
  }

  const data = await getData()

  return (
    <div>
      <PageTitle center={true}>
        <h1>Admin</h1>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <h2 className="mb-10">All Bolões by all users: {data.boloes.length}</h2>

        {data.boloes.map((el: Bolao) => {
          return <AdminBolao key={el.id} bolao={el} />
        })}
      </Suspense>
    </div>
  )
}

export default Admin
