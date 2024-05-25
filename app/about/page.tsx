import PageTitle from "../components/pageTitle"

const pClasses = "mb-10"
const h2Classes = "text-2xl mb-6 text-center"

export default function About() {
  return (
    <div>
      <PageTitle center={true}>
        <h1>About</h1>
      </PageTitle>

      <h2 className={h2Classes}>Why another app?</h2>
      <p className={pClasses}>
        I had been creating what brazilians call bolão, with friends for a while
        and it was time to look for a digital solution after much paper
        anotations and tabular docs. A bolão is basically a group that you
        create or participate in to bet on soccer championships here in Brazil.
        Very popular during the World Cup season every four years. But our
        favorite so far is the UEFA Champions League. It does not involve money
        even if most friends like to agree on a prize for the winner. But that's
        something the app does not deal with.
      </p>

      <p className={pClasses}>
        After much research of existing solution, i came to the reality that
        none of them was what i expected in terms of UX, design and
        functionality. That's when i started writing code, around 2017. The app
        has been growing ever since, fixing mistakes, going through massive
        updates and design changes.
      </p>

      <h2 className={h2Classes}>Who's behind this?</h2>
      <p className={pClasses}>
        This is a one person project for now. My name is Kevin and i'm a
        software developer and former web designer living in Rio de Janeiro -
        Brazil. If you really want to know more about me, head to LinkedIn. I
        work on the app almost every week day early in the morning.
      </p>

      <h2 className={h2Classes}>On the tech side</h2>

      <p className={pClasses}>
        As stated before, this is a web app, which means no Android or IOs extra
        app to download. Just open your browser at https://bolao.io. This allows
        me to constantly roll out updates without the users having to update
        their native apps and to handle just one code base. I'm alone on this,
        remember? Managing two apps would be way too much for me. The major down
        side of this solution, is the lack of notifications. More below.
      </p>

      <p className={pClasses}>
        The app is built with ReactJS, Redux, Webpack and code splitting on the
        front-end side. The back-end runs on NodeJS with Express, and stores
        data on a Mongo database via Mongoose. Hosted on Heroku and Bitbucket.
      </p>

      <p className={pClasses}>
        It uses Prismic.io for the headless CMS and applies tests via Jest an
        Cypress before each deploy. Design is done with Figma.
      </p>

      <h2 className={h2Classes}>Wait, no notifications?</h2>

      <p className={pClasses}>
        Indeed, the biggest flaw so far. I know that it's THE feature the app
        lacks to maybe gain traction but the IOs native support did not land
        yet.
      </p>

      <p className={pClasses}>
        Web push on Android works but a quick survey made me realize that 50% of
        my users do use IOs. I therefore decided to postpone the development of
        push notifications until it'd reach all my users.
      </p>

      <p className={pClasses}>
        I do believe that things are evolving in the good direction, Whether it
        be the increasing amount of people switching to Android or Apple
        deciding to ship such a feature onto its IOs browser Safari. I'll keep
        you guy posted in the news or tech news section.
      </p>
    </div>
  )
}
