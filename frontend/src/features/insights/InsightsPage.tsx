import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

import { useInsightsByCountry, useInsightsByCountryJobTitle } from './queries'

function centsToDollars(cents: number): number {
  return Math.round(cents / 100)
}

export function InsightsPage() {
  const byCountry = useInsightsByCountry()
  const byCountryJobTitle = useInsightsByCountryJobTitle()

  if (byCountry.isPending || byCountryJobTitle.isPending) {
    return <p>Loading insights…</p>
  }
  if (byCountry.isError || byCountryJobTitle.isError) {
    return <p>Failed to load insights.</p>
  }

  const countryData = byCountry.data.map((c) => ({
    country: c.country,
    min: centsToDollars(c.min_salary_cents),
    p25: centsToDollars(c.p25_salary_cents),
    median: centsToDollars(c.median_salary_cents),
    avg: centsToDollars(c.avg_salary_cents),
    p75: centsToDollars(c.p75_salary_cents),
    max: centsToDollars(c.max_salary_cents),
  }))

  const topJobTitleData = [...byCountryJobTitle.data]
    .sort((a, b) => b.avg_salary_cents - a.avg_salary_cents)
    .slice(0, 15)
    .map((row) => ({
      label: `${row.country} · ${row.job_title}`,
      avg: centsToDollars(row.avg_salary_cents),
    }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Salary insights</h2>
      <Card className="p-6">
        <h3 className="mb-4 text-base font-medium">Salary distribution by country</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value * 100)}
              />
              <Legend />
              <Bar dataKey="min" fill="#94a3b8" name="Min" />
              <Bar dataKey="p25" fill="#64748b" name="P25" />
              <Bar dataKey="median" fill="#475569" name="Median" />
              <Bar dataKey="avg" fill="#0f172a" name="Average" />
              <Bar dataKey="p75" fill="#334155" name="P75" />
              <Bar dataKey="max" fill="#1e293b" name="Max" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 text-base font-medium">
          Top 15 average salary by country and job title
        </h3>
        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <BarChart data={topJobTitleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="label" width={200} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value * 100)}
              />
              <Bar dataKey="avg" fill="#0f172a" name="Average salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
