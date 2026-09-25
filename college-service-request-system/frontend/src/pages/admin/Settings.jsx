import React, { useEffect, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { api } from '../../services/api'

export default function Settings() {
  const [sla, setSla] = useState({})
  const [weights, setWeights] = useState({})

  useEffect(() => {
    api.get('/api/sla/config').then((r) => setSla(r.data))
    api.get('/api/impact/weights').then((r) => setWeights(r.data))
  }, [])

  return (
    <AppLayout title="Configuration" subtitle="SLA targets and impact-scoring weights (read-only preview)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">SLA Targets (hours)</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(sla).map(([cat, v]) => (
              <div key={cat} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{cat.replace('_', ' ')}</span>
                <span className="text-white/80">Response {v.response}h · Resolution {v.resolution}h</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-white/70 mb-4">Impact Scoring Weights (max points)</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(weights).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/60">{k.replace(/_/g, ' ')}</span>
                <span className="text-white/80">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-white/30 mt-6">
        These values are defined in <code>backend/app/services/sla_service.py</code> and{' '}
        <code>backend/app/services/impact_engine.py</code>. Edit them there to change scoring/SLA behavior system-wide.
      </p>
    </AppLayout>
  )
}
