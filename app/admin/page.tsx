import { Suspense } from "react"
import { getBoloes, getUsers } from "@/app/lib/controllerAdmin"
import PageTitle from "@/app/components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Bolao, User } from "@/app/lib/definitions"
import AdminBolao from "@/app/components/adminBolao"
import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { navigate } from "@/app/lib/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function Admin() {
  const user = await currentUser()

  if (user) {
    const client = await clerkClient()
    const userData = await client.users.getUser(user.id)
    const role = userData.privateMetadata?.role || "guest"

    if (role !== "admin") {
      navigate("/")
    }
  }

  const dataBoloes = await getBoloes()
  const dataUsers = await getUsers()

  return (
    <div>
      <PageTitle center={true}>
        <h1>Admin</h1>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <Tabs defaultValue="boloes" className="">
          <TabsList>
            <TabsTrigger value="boloes">
              Bolões ({dataBoloes.boloes.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({dataUsers.users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boloes">
            {dataBoloes.boloes.map((el: Bolao) => {
              return <AdminBolao key={el.id} bolao={el} />
            })}
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-4">
              {dataUsers.users.map((el: User) => {
                return (
                  <div key={el.id} className="p-4 border rounded-lg">
                    <div className="font-semibold">{el.name}</div>
                    <div className="text-sm text-gray-600">ID: {el.id}</div>
                    <div className="text-sm text-gray-600">Role: {el.role}</div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}

export default Admin
