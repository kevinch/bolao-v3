import PageTitle from "@/app/components/pageTitle"
import Image from "next/image"

type Props = {
  bolaoName: string
  bolaoYear: string | number
  leagueName?: string
  leagueLogo?: string
}

function BolaoPageTitle({
  bolaoName,
  leagueName,
  leagueLogo,
  bolaoYear,
}: Props) {
  return (
    <PageTitle center={true}>
      {leagueLogo && (
        <div className="flex justify-center mb-6">
          <Image
            alt={`${leagueName}'s logo`}
            src={leagueLogo}
            width={40}
            height={40}
          />
        </div>
      )}

      {bolaoName}
      <br />
      <span className="text-lg">
        {leagueName} - {bolaoYear}
        <br />
      </span>
    </PageTitle>
  )
}

export default BolaoPageTitle
