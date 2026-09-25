import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PlusCircle } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { listServiceRequests } from '../../services/api'
import { StatusPill, PriorityPill, SlaPill } from '../../components/StatusPill'

const STATUS_OPTIONS = ['', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'REOPENED']

export default function RequestsList({ title = 'My Requests', baseParams = {}, linkPrefix = '/requests' }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    listServiceRequests({ ...baseParams, search: search || undefined, status: status || undefined, limit: 100 })
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status])

  return (
    <AppLayout title={title} subtitle={`${items.length} request${items.length === 1 ? '' : 's'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input pl-9"
            placeholder="Search by request #, title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <select className="input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
        <Link to="/requests/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" /> New Request
        </Link>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/5">
              <th className="px-5 py-3 font-medium">Request</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">SLA</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-5 py-3">
                  <Link to={`${linkPrefix}/${r.id}`} className="text-white/90 font-medium hover:text-accent-300">{r.title}</Link>
                  <div className="text-xs text-white/40">{r.request_number}</div>
                </td>
                <td className="px-5 py-3 text-white/60">{r.service_category.replace('_', ' ')}</td>
                <td className="px-5 py-3"><PriorityPill priority={r.priority} /></td>
                <td className="px-5 py-3"><SlaPill slaStatus={r.sla_status} /></td>
                <td className="px-5 py-3"><StatusPill status={r.status} /></td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-white/40">No requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
