import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { listServiceRequests, getRecurring, getDashboardCharts } from '../../services/api'
import { StatusPill, PriorityPill, SlaPill } from '../../components/StatusPill'

export default function LeadDashboard() {
  const [awaiting, setAwaiting] = useState([])
  const [highImpact, setHighImpact] = useState([])
  const [recurring, setRecurring] = useState([])
  const [charts, setCharts] = useState(null)

  useEffect(() => {
    listServiceRequests({ status: 'NEW', limit: 20 }).then((r) => setAwaiting(r.data.items))
    listServiceRequests({ limit: 100 }).then((r) => {
      setHighImpact(r.data.items.filter((i) => ['HIGH', 'CRITICAL'].includes(i.priority) && !['CLOSED'].includes(i.status)).slice(0, 6))
    })
    getRecurring({}).then((r) => setRecurring(r.data.slice(0, 4))).catch(() => {})
    getDashboardCharts().then((r) => setCharts(r.data))
  }, [])

  return (
    <AppLayout title="Service Lead Dashboard" subtitle="Requests awaiting assignment, workload, and SLA overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card"><div className="text-2xl font-semibold text-white">{awaiting.length}</div><div className="text-xs text-white/40 mt-1">Awaiting Assignment</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{highImpact.length}</div><div className="text-xs text-white/40 mt-1">High Impact Active</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{recurring.length}</div><div className="text-xs text-white/40 mt-1">Recurring Issues</div></div>
        <div className="card"><div className="text-2xl font-semibold text-white">{charts?.sla_compliance_pct ?? '—'}%</div><div className="text-xs text-white/40 mt-1">SLA Compliance</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Awaiting Assignment</h3>
          <div className="space-y-2">
            {awaiting.map((r) => (
              <Link key={r.id} to={`/lead/requests/${r.id}`} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10">
                <div>
                  <div className="text-sm text-white/90">{r.title}</div>
                  <div className="text-xs text-white/40">{r.request_number} · {r.location}</div>
                </div>
                <PriorityPill priority={r.priority} />
              </Link>
            ))}
            {awaiting.length === 0 && <p className="text-sm text-white/40">Nothing waiting — great job.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Staff Workload</h3>
          <div className="space-y-2">
            {(charts?.staff_workload || []).map((w) => (
              <div key={w.staff} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{w.staff}</span>
                <span className="text-white/40">{w.open_requests} open</span>
              </div>
            ))}
            {(!charts || charts.staff_workload.length === 0) && <p className="text-sm text-white/40">No active assignments.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">High Impact Active Requests</h3>
          <div className="space-y-2">
            {highImpact.map((r) => (
              <Link key={r.id} to={`/lead/requests/${r.id}`} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10">
                <div>
                  <div className="text-sm text-white/90">{r.title}</div>
                  <div className="text-xs text-white/40">{r.request_number} · impact {r.impact_score}</div>
                </div>
                <div className="flex items-center gap-2"><PriorityPill priority={r.priority} /><SlaPill slaStatus={r.sla_status} /></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Recurring Issues</h3>
          <div className="space-y-3">
            {recurring.map((r, i) => (
              <div key={i} className="px-3 py-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <div className="text-sm text-white/90">{r.location} — {r.service_category.replace('_', ' ')}</div>
                <div className="text-xs text-white/40">{r.count} similar requests · {r.suggested_action}</div>
              </div>
            ))}
            {recurring.length === 0 && <p className="text-sm text-white/40">No recurring patterns detected.</p>}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
