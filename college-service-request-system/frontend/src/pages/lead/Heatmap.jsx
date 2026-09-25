import React, { useEffect, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { getHeatmap } from '../../services/api'

const SERVICE_OPTIONS = ['', 'IT_SUPPORT', 'HOSTEL', 'TRANSPORT', 'LIBRARY', 'ID_CARD', 'BONAFIDE_CERTIFICATE']
const TIME_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'semester', label: 'This semester' },
]

function intensity(count, max) {
  if (!max) return 0
  return Math.min(1, count / max)
}

export default function Heatmap() {
  const [service, setService] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getHeatmap({ service_category: service || undefined, time_range: timeRange }).then((r) => setData(r.data))
  }, [service, timeRange])

  const max = data ? Math.max(1, ...data.locations.map((l) => l.total)) : 1

  return (
    <AppLayout title="Campus Service Heatmap" subtitle="Where service requests are concentrated across campus">
      <div className="flex items-center gap-3 mb-6">
        <select className="input w-48" value={service} onChange={(e) => setService(e.target.value)}>
          {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All services'}</option>)}
        </select>
        <select className="input w-48" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          {TIME_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card"><div className="text-2xl font-semibold text-white">{data.summary.total_issues}</div><div className="text-xs text-white/40 mt-1">Total Issues</div></div>
          <div className="card"><div className="text-lg font-semibold text-white truncate">{data.summary.top_hotspot || '—'}</div><div className="text-xs text-white/40 mt-1">Top Hotspot</div></div>
          <div className="card"><div className="text-lg font-semibold text-white truncate">{data.summary.most_reported_service?.replace('_', ' ') || '—'}</div><div className="text-xs text-white/40 mt-1">Most Reported Service</div></div>
          <div className="card"><div className="text-2xl font-semibold text-white">{data.summary.recurring_hotspots}</div><div className="text-xs text-white/40 mt-1">Recurring Hotspots</div></div>
        </div>
      )}

      {/* Offline-friendly campus-layout fallback grid (no external map tiles needed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Campus Layout</h3>
          <div className="grid grid-cols-3 gap-3">
            {(data?.locations || []).map((loc) => {
              const t = intensity(loc.total, max)
              const bg = `rgba(244, 63, 94, ${0.08 + t * 0.35})`
              const border = `rgba(244, 63, 94, ${0.2 + t * 0.5})`
              return (
                <button
                  key={loc.location}
                  onClick={() => setSelected(loc)}
                  style={{ background: bg, borderColor: border }}
                  className="rounded-xl border p-4 text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="text-sm font-medium text-white">{loc.location}</div>
                  <div className="text-2xl font-semibold text-white mt-2">{loc.total}</div>
                  <div className="text-[11px] text-white/50 mt-1">requests</div>
                  {loc.recurring_issue && <div className="mt-2 pill bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">RECURRING</div>}
                </button>
              )
            })}
            {(!data || data.locations.length === 0) && <p className="text-sm text-white/40 col-span-3">No data for this filter.</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Location Detail</h3>
          {!selected && <p className="text-sm text-white/40">Click a location to see details.</p>}
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="text-white font-medium">{selected.location}</div>
              <Row label="Total Requests" value={selected.total} />
              <Row label="Open" value={selected.open} />
              <Row label="Resolved" value={selected.resolved} />
              <Row label="Most Common Service" value={selected.most_common_service?.replace('_', ' ') || '—'} />
              <Row label="Recurring Issue" value={selected.recurring_issue ? 'Yes' : 'No'} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}
