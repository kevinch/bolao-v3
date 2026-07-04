# Recharts for Statistics tab charts

The Statistics tab needs two client-side charts (position evolution line chart, personal tier breakdown). We chose **Recharts** over Chart.js, Nivo, or hand-rolled SVG. Recharts is the common pairing with React + Shadcn, supports the chart types we need, and keeps data fetching on the server with thin client chart wrappers — matching existing patterns like `FixtureDate` and `ChampionPickSelector`.
