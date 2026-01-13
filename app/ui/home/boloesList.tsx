import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  const { userId }: { userId: string | null } = await auth() // could go to context?

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
        <Button asChild size="lg">
          <Link href="/bolao/create">Create bolão</Link>
        </Button>
      </div>
    )
  }

  const activeGroup: Bolao[] = []
  const pastGroup: Bolao[] = []
  const currentYear = new Date().getFullYear()
  const today = new Date()

  const sortedData = [...data].sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year
    }
    const timeA = a.start ? new Date(a.start).getTime() : 0
    const timeB = b.start ? new Date(b.start).getTime() : 0
    return timeB - timeA
  })

  sortedData.forEach((el: Bolao) => {
    if (el.year === currentYear) {
      activeGroup.push(el)
    } else if (el.end) {
      const groupEndDate = new Date(el.end)

      if (groupEndDate >= today) {
        activeGroup.push(el)
      } else {
        pastGroup.push(el)
      }
    } else {
      pastGroup.push(el)
    }
  })

  return (
    <Tabs defaultValue="account" className="">
      <div className="flex justify-between mb-4">
        <TabsList>
          <TabsTrigger value="account">Active bolões</TabsTrigger>
          <TabsTrigger value="password">Past bolões</TabsTrigger>
        </TabsList>

        <Button asChild size="sm">
          <Link href="/bolao/create">Create bolão</Link>
        </Button>
      </div>
      <TabsContent value="account">
        {activeGroup.map((el: Bolao, i: number) => (
          <BolaoCard key={`active_${el.id}_${i}`} bolao={el} userId={userId} />
        ))}
      </TabsContent>
      <TabsContent value="password">
        {pastGroup.map((el: Bolao, i: number) => (
          <BolaoCard key={`past_${el.id}_${i}`} bolao={el} userId={userId} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

export default BoloesList
