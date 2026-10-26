import { Suspense } from "react"
import { getBoloes } from "@/app/lib/controllerAdmin"
import PageTitle from "@/app/components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Bolao } from "@/app/lib/definitions"
import AdminBolao from "@/app/components/adminBolao"
import AdminUsage from "@/app/components/adminUsage"
import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { navigate } from "@/app/lib/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "next-intl/server"

async function Admin() {
  const user = await currentUser()
  const client = await clerkClient()

  if (user) {
    const userData = await client.users.getUser(user.id)
    const role = userData.privateMetadata?.role || "guest"

    if (role !== "admin") {
      navigate("/")
    }
  }

  const [dataBoloes, clerkUserCount] = await Promise.all([
    getBoloes(),
    client.users.getCount(),
  ])
  const t = await getTranslations("adminUsage")

  return (
    <div>
      <PageTitle center={true}>
        <h1>Admin</h1>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <Tabs defaultValue="usage" className="">
          <TabsList>
            <TabsTrigger value="usage">{t("heading")}</TabsTrigger>
            <TabsTrigger value="boloes">
              {t("boloesTab", { count: dataBoloes.boloes.length })}
            </TabsTrigger>
            <TabsTrigger value="users">
              {t("usersTab", { count: clerkUserCount })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
              <AdminUsage />
            </Suspense>
          </TabsContent>

          <TabsContent value="boloes">
            {dataBoloes.boloes.map((el: Bolao) => {
              return <AdminBolao key={el.id} bolao={el} />
            })}
          </TabsContent>

          <TabsContent value="users">
            <p>{t("clerkUsersSummary", { count: clerkUserCount })}</p>
          </TabsContent>

        </Tabs>
      </Suspense>
    </div>
  )
}

export default Admin
