# Recharts for Statistics tab charts

The Statistics tab needs two client-side charts (position evolution line chart, personal tier breakdown). We chose **Recharts** over Chart.js, Nivo, or hand-rolled SVG. Recharts is the common pairing with React + Shadcn, supports the chart types we need, and keeps data fetching on the server with thin client chart wrappers — matching existing patterns like `FixtureDate` and `ChampionPickSelector`.

## OpenSSF Scorecard note

Recharts transitively depends on stable d3 modules (`d3-scale`, `d3-shape`, etc.) whose upstream repos score low on OpenSSF Scorecard **maintenance** checks because they rarely need commits — not because of known CVEs. Dependency Review still fails on moderate+ vulnerabilities; we disable Scorecard score warnings (`warn-on-openssf-scorecard-level: 0`) to avoid false positives on these transitive deps.
