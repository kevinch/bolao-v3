import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchBoloesByUserId } from "@/app/lib/data"
import { auth } from "@clerk/nextjs/server"
import { unstable_noStore as noStore } from "next/cache"
import { Bolao } from "@/app/lib/definitions"
import BolaoCard from "@/app/components/bolaoCard"

async function getData(userId: string) {
  noStore()

  const result = await fetchBoloesByUserId(userId)

  return result
}

async function BoloesList() {
  const { userId }: { userId: string | null } = auth() // could go to context?

  if (!userId) {
    return
  }

  let data: Bolao[] = []

  if (userId) {
    data = await getData(userId)
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center flex-col space-y-8 uppercase">
        <Link className="underline hover:no-underline" href="/bolao/create">
          Create Bolão
        </Link>
      </div>
    )
  }

  const activeGroup: Bolao[] = []
  const passiveGroup: Bolao[] = []
  const currentYear = new Date().getFullYear()
  const today = new Date()

  data.forEach((el: Bolao) => {
    if (el.end) {
      const groupEndDate = new Date(el.end)

      if (groupEndDate >= today) {
        activeGroup.push(el)
      } else {
        passiveGroup.push(el)
      }
    } else if (el.year === currentYear) {
      activeGroup.push(el)
    } else {
      passiveGroup.push(el)
    }
  })

  return (
    <Tabs defaultValue="account" className="">
      <TabsList>
        <TabsTrigger value="account">Active bolões</TabsTrigger>
        <TabsTrigger value="password">Past bolões</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        {activeGroup.map((el: Bolao) => (
          <BolaoCard key={el.id} bolao={el} userId={userId} />
        ))}
      </TabsContent>
      <TabsContent value="password">
        {passiveGroup.map((el: Bolao) => (
          <BolaoCard key={el.id} bolao={el} userId={userId} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

export default BoloesList
