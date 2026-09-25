import React, { useEffect, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { getAuditLogs } from '../../services/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  useEffect(() => { getAuditLogs().then((r) => setLogs(r.data)) }, [])

  return (
    <AppLayout title="Audit Logs" subtitle={`${logs.length} recent actions across the system`}>
      <div className="card !p-0 divide-y divide-white/5">
        {logs.map((a) => (
          <div key={a.id} className="px-5 py-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-white/80">{a.details}</div>
              <div className="text-xs text-white/30 mt-0.5">{a.actor_name} · {a.actor_role.replace('_', ' ')} · {a.action}</div>
            </div>
            <div className="text-xs text-white/30 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-white/40 p-6">No audit entries yet.</p>}
      </div>
    </AppLayout>
  )
}
