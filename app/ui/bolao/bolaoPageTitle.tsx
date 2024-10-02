import PageTitle from "@/app/components/pageTitle"
import Image from "next/image"
import BolaoYearBadge from "@/app/components/bolaoYearBadge"
import type { Bolao } from "@/app/lib/definitions"

type Props = {
  bolao: Bolao
  leagueName?: string
  leagueLogo?: string
}

function BolaoPageTitle({ leagueName, leagueLogo, bolao }: Props) {
  return (
    <PageTitle center={true}>
      {leagueLogo && (
        <div className="flex justify-center mb-6">
          <Image
            alt={`${leagueName}'s logo`}
            src={leagueLogo}
            width={60}
            height={60}
          />
        </div>
      )}

      {bolao.name}
      <br />
      <span className="text-lg">
        {leagueName} <BolaoYearBadge bolao={bolao} />
        <br />
      </span>
    </PageTitle>
  )
}

export default BolaoPageTitle
