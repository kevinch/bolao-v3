import Link from "next/link"
import PageTitle from "@/app/components/pageTitle"

const pClasses = "mb-10"
const h2Classes = "text-2xl mb-6 text-center"

export default function About() {
  return (
    <div>
      <PageTitle center={true}>
        <h1>About</h1>
      </PageTitle>

      <h2 className={h2Classes}>Bolão?</h2>
      <p className={pClasses}>
        In Brazil, a bolão is a betting pool between friends usually around
        soccer championships. It is very popular during the World Cup and other
        major tournaments. For the pronunciation check this{" "}
        <Link
          className="underline hover:no-underline"
          href="https://en.wiktionary.org/wiki/bol%C3%A3o"
        >
          wiki page
        </Link>
        .
      </p>

      <p className={pClasses}>
        We started around 2016 doing them on a piece of paper and I decided to
        try a digital solution. It does not involve money even if most friends
        like to agree on a prize for the winner. But that's something the app
        does not deal with.
      </p>

      <p className={pClasses}>
        After much research of existing solutions, I came to the reality that
        none of them was what I expected in terms of UX, design and
        functionality. That's when I started writing code, around 2017. The app
        has been growing ever since, fixing mistakes, going through massive
        updates and design changes. This very version your are on is the major
        3, or the third big iteration of the application.
      </p>

      <h2 className={h2Classes}>Who's behind this?</h2>
      <p className={pClasses}>
        This is a one person project. My name is Kevin and I'm a software
        developer and former web designer living in Rio de Janeiro - Brazil. If
        you really want to know more about me, head to{" "}
        <Link
          className="underline hover:no-underline"
          href="https://www.linkedin.com/in/kevinchevallier/"
          target="_blank"
        >
          LinkedIn
        </Link>
        .
      </p>

      <h2 className={h2Classes}>On the tech side</h2>

      <p className={pClasses}>
        As stated before, this is a web app, which means no Android or IOs extra
        app to download. Just open your browser at https://bolao.io. This allows
        me to constantly roll out changes without the users having to update
        their native apps.
      </p>

      <p className={pClasses}>
        The app is built with NextJS, Typescript and React, hosted at Vercel and
        uses Postgres for the database. It uses Prismic.io for the headless CMS
        and Clerk for the auth management.
      </p>

      <h2 className={h2Classes}>Soccer coverage</h2>
      <p className={pClasses}>
        The app uses the API of{" "}
        <Link
          href="https://api-sports.io/sports/football"
          className="underline hover:no-underline"
          target="_blank"
        >
          api-football.com
        </Link>{" "}
        to get the latest fixtures and results. For now just a handful of
        leagues are available, but upon request more could be added. Feel free
        to reach me at{" "}
        <Link
          className="underline hover:no-underline"
          href="https://www.linkedin.com/in/kevinchevallier/"
          target="_blank"
        >
          LinkedIn
        </Link>
        .
      </p>
    </div>
  )
}
