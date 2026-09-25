import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import AppLayout from '../../layouts/AppLayout'
import { getDashboardCharts, getDashboardSummary } from '../../services/api'

const COLORS = ['#4f7cff', '#6b93ff', '#94b1ff', '#22c55e', '#f59e0b', '#f43f5e']

export default function Analytics() {
  const [charts, setCharts] = useState(null)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getDashboardCharts().then((r) => setCharts(r.data))
    getDashboardSummary().then((r) => setSummary(r.data))
  }, [])

  const byService = charts ? Object.entries(charts.by_service).map(([k, v]) => ({ name: k.replace('_', ' '), value: v })) : []
  const byStatus = charts ? Object.entries(charts.by_status).map(([k, v]) => ({ name: k.replace('_', ' '), value: v })) : []

  return (
    <AppLayout title="Service Analytics" subtitle="Real-time metrics computed from stored request data">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card"><div className="text-2xl font-semibold text-white">{summary?.total ?? '—'}</div><div className="text-xs text-white/40 mt-1">Total Requests</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{charts?.avg_resolution_hours ?? '—'}h</div><div className="text-xs text-white/40 mt-1">Avg Resolution Time</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{charts?.sla_compliance_pct ?? '—'}%</div><div className="text-xs text-white/40 mt-1">SLA Compliance</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{summary?.sla_breached ?? '—'}</div><div className="text-xs text-white/40 mt-1">SLA Breached (open)</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Requests by Service</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byService}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff60', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1526', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="value" fill="#4f7cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f1526', border: '1px solid rgba(255,255,255,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-white/70 mb-4">Monthly Request Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={charts?.monthly_trend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#ffffff60', fontSize: 11 }} />
            <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f1526', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Line type="monotone" dataKey="count" stroke="#6b93ff" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AppLayout>
  )
}
