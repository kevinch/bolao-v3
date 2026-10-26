"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UsageData = {
  summary: { totalBoloes: number }
  monthly: { month: string; count: number; members: number }[]
  competitions: {
    id: string
    month: string
    name: string
    country: string | null
    count: number
  }[]
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminUsageDashboard({
  data,
  clerkUserCount,
}: {
  data: UsageData
  clerkUserCount: number
}) {
  const t = useTranslations("adminUsage")
  const locale = useLocale()
  const [monthsToShow, setMonthsToShow] = useState(6)
  const monthly = data.monthly.slice(-monthsToShow)
  const formatMonth = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number)
    return new Date(year, monthNumber - 1, 1).toLocaleDateString(
      locale === "pt-br" ? "pt-BR" : locale,
      { month: "short", year: "2-digit" }
    )
  }
  const bolaoCount = monthly.reduce((total, month) => total + month.count, 0)
  const memberCount = monthly.reduce((total, month) => total + month.members, 0)
  const averageMembers = bolaoCount === 0 ? 0 : memberCount / bolaoCount
  const visibleMonthKeys = new Set(monthly.map((month) => month.month))
  const competitionCounts = new Map<
    string,
    { name: string; country: string | null; count: number }
  >()

  for (const competition of data.competitions) {
    if (!visibleMonthKeys.has(competition.month)) continue
    const current = competitionCounts.get(competition.id) ?? {
      name: competition.name,
      country: competition.country,
      count: 0,
    }
    current.count += competition.count
    competitionCounts.set(competition.id, current)
  }

  const competitions = [...competitionCounts.entries()]
    .map(([id, competition]) => ({ id, ...competition }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const maxMonthlyCount = Math.max(1, ...monthly.map((month) => month.count))
  const maxCompetitionCount = Math.max(
    1,
    ...competitions.map((competition) => competition.count)
  )
  const firstMonthLabel = monthly[0] ? formatMonth(monthly[0].month) : ""
  const lastMonth = monthly.at(-1)
  const lastMonthLabel = lastMonth ? formatMonth(lastMonth.month) : ""
  const rangeLabel = `${firstMonthLabel} – ${lastMonthLabel}`

  return (
    <section aria-labelledby="usage-heading" className="mb-12 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="usage-heading" className="text-2xl font-semibold">
            {t("heading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="usage-range" className="text-sm font-medium">
            {t("periodLabel")}
          </label>
          <Select
            value={String(monthsToShow)}
            onValueChange={(value) => setMonthsToShow(Number(value))}
          >
            <SelectTrigger id="usage-range" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">{t("period6Months")}</SelectItem>
              <SelectItem value="12">{t("period12Months")}</SelectItem>
              <SelectItem value="24">{t("period24Months")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("totalBoloesAllTime")} value={data.summary.totalBoloes} />
        <MetricCard label={t("clerkUsersAllTime")} value={clerkUserCount} />
        <MetricCard
          label={t("boloesCreatedMonths", { months: monthsToShow })}
          value={bolaoCount}
        />
        <MetricCard
          label={t("averageMembersMonths", { months: monthsToShow })}
          value={averageMembers.toFixed(1)}
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("createdByMonth")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("rangeCalendarMonths", { range: rangeLabel, months: monthsToShow })}
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div
              className="flex h-48 items-end gap-2"
              role="img"
              aria-label={t("chartDescription", { range: rangeLabel })}
            >
              {monthly.map((month) => (
                <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">{month.count}</span>
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: `${Math.max(4, (month.count / maxMonthlyCount) * 100)}%` }}
                    title={
                      month.count === 1
                        ? t("oneBolaoCreated", { month: formatMonth(month.month) })
                        : t("manyBoloesCreated", {
                            month: formatMonth(month.month),
                            count: month.count,
                          })
                    }
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {formatMonth(month.month)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("mostUsedChampionships")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("championshipsCreatedRange", { range: rangeLabel })}
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {competitions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("noBoloesInPeriod")}
              </p>
            ) : (
              <ol className="space-y-4">
                {competitions.slice(0, 8).map((competition) => (
                  <li key={competition.id}>
                    <div className="mb-1 flex justify-between gap-4 text-sm">
                      <span className="truncate">
                        {competition.name}
                        {competition.country && (
                          <span className="ml-2 text-muted-foreground">
                            {competition.country}
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{competition.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-muted">
                      <div
                        className="h-full rounded bg-primary"
                        style={{ width: `${(competition.count / maxCompetitionCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
