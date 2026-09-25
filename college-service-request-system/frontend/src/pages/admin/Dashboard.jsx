import React, { useEffect, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { getDashboardSummary, getDashboardCharts } from '../../services/api'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)

  useEffect(() => {
    getDashboardSummary().then((r) => setSummary(r.data))
    getDashboardCharts().then((r) => setCharts(r.data))
  }, [])

  const cards = summary ? [
    { label: 'Total Requests', value: summary.total },
    { label: 'New', value: summary.by_status.NEW },
    { label: 'Assigned', value: summary.by_status.ASSIGNED },
    { label: 'In Progress', value: summary.by_status.IN_PROGRESS },
    { label: 'On Hold', value: summary.by_status.ON_HOLD },
    { label: 'Resolved', value: summary.by_status.RESOLVED },
    { label: 'Closed', value: summary.by_status.CLOSED },
    { label: 'SLA Breached', value: summary.sla_breached },
  ] : []

  return (
    <AppLayout title="Admin Dashboard" subtitle="Nexus Institute of Technology — system-wide overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-2xl font-semibold text-white">{c.value ?? '—'}</div>
            <div className="text-xs text-white/40 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-white/40 mb-1">Avg Resolution Time</div>
          <div className="text-2xl font-semibold text-white">{charts?.avg_resolution_hours ?? '—'}h</div>
        </div>
        <div className="card">
          <div className="text-xs text-white/40 mb-1">SLA Compliance</div>
          <div className="text-2xl font-semibold text-white">{charts?.sla_compliance_pct ?? '—'}%</div>
        </div>
        <div className="card">
          <div className="text-xs text-white/40 mb-1">Staff Tracked</div>
          <div className="text-2xl font-semibold text-white">{charts?.staff_workload?.length ?? '—'}</div>
        </div>
      </div>

      <p className="text-xs text-white/30 mt-6">
        See <a href="/lead/analytics" className="text-accent-300 hover:underline">Analytics</a> for full charts and{' '}
        <a href="/lead/heatmap" className="text-accent-300 hover:underline">Campus Heatmap</a> for location data.
      </p>
    </AppLayout>
  )
}
