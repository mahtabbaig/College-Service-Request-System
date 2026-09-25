import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { listServiceRequests } from '../../services/api'
import { StatusPill, PriorityPill, SlaPill } from '../../components/StatusPill'
import { useAuth } from '../../context/AuthContext'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => { listServiceRequests({ limit: 100 }).then((r) => setItems(r.data.items)) }, [])

  const buckets = {
    'New Assignments': items.filter((i) => i.status === 'ASSIGNED'),
    'In Progress': items.filter((i) => i.status === 'IN_PROGRESS'),
    'On Hold': items.filter((i) => i.status === 'ON_HOLD'),
    'SLA Approaching / Breached': items.filter((i) => ['APPROACHING_SLA', 'SLA_BREACHED'].includes(i.sla_status)),
    'Recently Resolved': items.filter((i) => i.status === 'RESOLVED'),
  }

  return (
    <AppLayout title={`Welcome, ${user?.name?.split(' ')[0]}`} subtitle="Your assigned service requests">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(buckets).map(([label, list]) => (
          <div key={label} className="card">
            <div className="text-2xl font-semibold text-white">{list.length}</div>
            <div className="text-xs text-white/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="card !p-0">
        <div className="px-5 py-4 border-b border-white/5"><h3 className="text-white font-medium text-sm">All Assigned Requests</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/5">
              <th className="px-5 py-3 font-medium">Request</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">SLA</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-5 py-3">
                  <Link to={`/staff/requests/${r.id}`} className="text-white/90 font-medium hover:text-accent-300">{r.title}</Link>
                  <div className="text-xs text-white/40">{r.request_number}</div>
                </td>
                <td className="px-5 py-3"><PriorityPill priority={r.priority} /></td>
                <td className="px-5 py-3"><SlaPill slaStatus={r.sla_status} /></td>
                <td className="px-5 py-3"><StatusPill status={r.status} /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-white/40">No assignments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
