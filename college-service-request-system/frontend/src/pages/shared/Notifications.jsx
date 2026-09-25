import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api'

export default function Notifications() {
  const [items, setItems] = useState([])

  const load = () => listNotifications().then((r) => setItems(r.data.items))
  useEffect(() => { load() }, [])

  const readOne = (id) => markNotificationRead(id).then(load)
  const readAll = () => markAllNotificationsRead().then(load)

  return (
    <AppLayout title="Notifications" subtitle={`${items.filter(i => !i.read).length} unread`}>
      <div className="flex justify-end mb-4">
        <button onClick={readAll} className="btn-secondary flex items-center gap-2 text-sm">
          <CheckCheck className="w-4 h-4" /> Mark all as read
        </button>
      </div>
      <div className="card !p-0 divide-y divide-white/5">
        {items.length === 0 && <p className="text-sm text-white/40 p-6">No notifications yet.</p>}
        {items.map((n) => (
          <div key={n.id} className={`px-5 py-4 flex items-start justify-between gap-4 ${!n.read ? 'bg-accent-500/5' : ''}`}>
            <div>
              <p className="text-sm text-white/80">{n.message}</p>
              <p className="text-xs text-white/30 mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {n.request_id && (
                <Link to={`/requests/${n.request_id}`} className="text-xs text-accent-300 hover:underline">View</Link>
              )}
              {!n.read && (
                <button onClick={() => readOne(n.id)} className="text-xs text-white/40 hover:text-white/70">Mark read</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
