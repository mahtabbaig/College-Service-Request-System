import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FileText, Bell } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { getDashboardSummary, listServiceRequests } from '../../services/api'
import { StatusPill, PriorityPill } from '../../components/StatusPill'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getDashboardSummary().then((r) => setSummary(r.data))
    listServiceRequests({ limit: 5 }).then((r) => setRecent(r.data.items))
  }, [])

  const cards = summary ? [
    { label: 'Total Requests', value: summary.total },
    { label: 'New', value: summary.by_status.NEW },
    { label: 'In Progress', value: summary.by_status.IN_PROGRESS },
    { label: 'Resolved', value: summary.by_status.RESOLVED },
    { label: 'Closed', value: summary.by_status.CLOSED },
  ] : []

  return (
    <AppLayout title={`Welcome, ${user?.name?.split(' ')[0] || ''}`} subtitle="Here's what's happening with your requests">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-2xl font-semibold text-white">{c.value ?? '—'}</div>
            <div className="text-xs text-white/40 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/requests/new" className="card flex items-center gap-3 hover:border-accent-500/40 border border-transparent">
          <PlusCircle className="w-5 h-5 text-accent-300" />
          <span className="text-white/80 text-sm font-medium">Create Request</span>
        </Link>
        <Link to="/requests" className="card flex items-center gap-3 hover:border-accent-500/40 border border-transparent">
          <FileText className="w-5 h-5 text-accent-300" />
          <span className="text-white/80 text-sm font-medium">My Requests</span>
        </Link>
        <Link to="/notifications" className="card flex items-center gap-3 hover:border-accent-500/40 border border-transparent">
          <Bell className="w-5 h-5 text-accent-300" />
          <span className="text-white/80 text-sm font-medium">Notifications</span>
        </Link>
      </div>

      <div className="card">
        <h3 className="text-white font-medium mb-4">Recent Requests</h3>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-sm text-white/40">No requests yet — create your first one.</p>}
          {recent.map((r) => (
            <Link key={r.id} to={`/requests/${r.id}`} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10">
              <div>
                <div className="text-sm text-white/90 font-medium">{r.title}</div>
                <div className="text-xs text-white/40">{r.request_number} · {r.service_category.replace('_', ' ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityPill priority={r.priority} />
                <StatusPill status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
