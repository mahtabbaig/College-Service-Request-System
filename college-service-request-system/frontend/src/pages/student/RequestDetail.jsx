import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Send, Upload, RefreshCcw } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import {
  getServiceRequest, getRequestAudit, listComments, addComment,
  changeRequestStatus, assignStaff, setWorkaround, confirmResolution,
  listStaff,
} from '../../services/api'
import { StatusPill, PriorityPill, SlaPill } from '../../components/StatusPill'
import { useAuth } from '../../context/AuthContext'

const TIMELINE_STEPS = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const NEXT_STATUS = {
  ASSIGNED: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  ON_HOLD: 'IN_PROGRESS',
}

export default function RequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [req, setReq] = useState(null)
  const [audit, setAudit] = useState([])
  const [comments, setComments] = useState([])
  const [message, setMessage] = useState('')
  const [staffOptions, setStaffOptions] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [workaroundText, setWorkaroundText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    getServiceRequest(id).then((r) => setReq(r.data))
    getRequestAudit(id).then((r) => setAudit(r.data))
    listComments(id).then((r) => setComments(r.data))
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (user?.role === 'SERVICE_LEAD' || user?.role === 'ADMIN') {
      listStaff().then((r) => setStaffOptions(r.data))
    }
  }, [user])

  if (!req) return <AppLayout title="Loading..." />

  const isRequester = req.requester_id === user.id
  const isAssignedStaff = req.assigned_staff_id === user.id
  const canManageStatus = (user.role === 'SERVICE_STAFF' && isAssignedStaff) || user.role === 'ADMIN'
  const canAssign = user.role === 'SERVICE_LEAD' || user.role === 'ADMIN'

  const act = async (fn) => {
    setBusy(true); setError('')
    try { await fn(); load() } catch (err) { setError(err?.response?.data?.detail || 'Action failed') }
    finally { setBusy(false) }
  }

  const doStatusChange = (newStatus) => act(() => changeRequestStatus(id, { new_status: newStatus }))
  const doAssign = () => selectedStaff && act(() => assignStaff(id, { staff_id: selectedStaff }))
  const doWorkaround = () => workaroundText && act(() => setWorkaround(id, { alternative: workaroundText })).then(() => setWorkaroundText(''))
  const doConfirm = (accepted) => act(() => confirmResolution(id, { accepted }))
  const submitComment = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    act(async () => { await addComment(id, message); setMessage('') })
  }

  const stepIndex = TIMELINE_STEPS.indexOf(req.status)

  return (
    <AppLayout title={req.request_number} subtitle={req.title}>
      {error && <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{req.title}</h2>
                <p className="text-sm text-white/40 mt-1">{req.service_category.replace('_', ' ')} · {req.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityPill priority={req.priority} />
                <StatusPill status={req.status} />
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{req.description}</p>

            {Object.keys(req.form_data || {}).length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                {Object.entries(req.form_data).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[11px] uppercase text-white/30">{k.replace('_', ' ')}</div>
                    <div className="text-sm text-white/80">{String(v)}</div>
                  </div>
                ))}
              </div>
            )}

            {req.workaround && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="pill bg-accent-500/15 text-accent-300 border border-accent-500/30 mb-2">WORKAROUND PROVIDED</div>
                <p className="text-sm text-white/70">Alternative: <span className="text-white">{req.workaround.alternative}</span></p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-sm font-medium text-white/70 mb-5">Timeline</h3>
            <div className="flex items-center">
              {TIMELINE_STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1.5">
                    {i <= stepIndex && req.status !== 'REOPENED'
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className="w-5 h-5 text-white/20" />}
                    <span className="text-[11px] text-white/40 text-center w-16">{s.replace('_', ' ')}</span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-px ${i < stepIndex ? 'bg-emerald-400/50' : 'bg-white/10'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {req.status === 'REOPENED' && (
              <div className="mt-3 pill bg-rose-500/15 text-rose-300 border border-rose-500/30">REOPENED — back in progress</div>
            )}

            <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
              {audit.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <div className="w-16 shrink-0 text-white/30 text-xs pt-0.5">
                    <div className="w-16 shrink-0 text-white/30 text-xs pt-0.5">
  {new Date(a.created_at).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  })}
</div>
                  </div>
                  <div className="text-white/60">{a.details}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <h3 className="text-sm font-medium text-white/70 mb-4">Comments</h3>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {comments.length === 0 && <p className="text-sm text-white/30">No comments yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="bg-white/5 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white/80">{c.author}</span>
                    <span className="text-[10px] text-white/30">{c.role.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-white/70">{c.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="flex gap-2">
              <input className="input flex-1" placeholder="Write a comment..." value={message} onChange={(e) => setMessage(e.target.value)} />
              <button className="btn-primary flex items-center gap-1.5" disabled={busy}><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-white/70 mb-1">Details</h3>
            <Row label="Requester" value={req.requester_name} />
            <Row label="Assigned Staff" value={req.assigned_staff_name || 'Unassigned'} />
            <Row label="Impact Score" value={`${req.impact_score}/100`} />
            <Row label="SLA Status" value={<SlaPill slaStatus={req.sla_status} />} />
            <Row label="Resolution Deadline" value={new Date(req.sla_resolution_deadline).toLocaleString()} />
            <Row label="Created" value={new Date(req.created_at).toLocaleString()} />
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-white/70 mb-3">Impact Factors</h3>
            <div className="space-y-2">
              {(req.impact_factors || []).map((f) => (
                <div key={f.name} className="text-xs">
                  <div className="flex justify-between text-white/60"><span>{f.name}</span><span>+{f.points}</span></div>
                  <div className="text-white/30">{f.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Requester actions */}
          {isRequester && req.status === 'RESOLVED' && (
            <div className="card space-y-2">
              <h3 className="text-sm font-medium text-white/70 mb-1">Confirm Resolution</h3>
              <p className="text-xs text-white/40 mb-2">Is your issue actually resolved?</p>
              <button className="btn-primary w-full" disabled={busy} onClick={() => doConfirm(true)}>Yes, confirm & close</button>
              <button className="btn-secondary w-full flex items-center justify-center gap-2" disabled={busy} onClick={() => doConfirm(false)}>
                <RefreshCcw className="w-3.5 h-3.5" /> No, reopen
              </button>
            </div>
          )}

          {/* Lead: assign */}
          {canAssign && (
            <div className="card space-y-2">
              <h3 className="text-sm font-medium text-white/70 mb-1">{req.assigned_staff_id ? 'Reassign Staff' : 'Assign Staff'}</h3>
              <select className="input" value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                <option value="">Select staff member...</option>
                {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.department}</option>)}
              </select>
              <button className="btn-primary w-full" disabled={busy || !selectedStaff} onClick={doAssign}>Assign</button>
            </div>
          )}

          {/* Staff: status actions */}
          {canManageStatus && NEXT_STATUS[req.status] && (
            <div className="card space-y-2">
              <h3 className="text-sm font-medium text-white/70 mb-1">Update Status</h3>
              <button className="btn-primary w-full" disabled={busy} onClick={() => doStatusChange(NEXT_STATUS[req.status])}>
                Move to {NEXT_STATUS[req.status].replace('_', ' ')}
              </button>
              {req.status === 'IN_PROGRESS' && (
                <button className="btn-secondary w-full" disabled={busy} onClick={() => doStatusChange('ON_HOLD')}>Put On Hold</button>
              )}
            </div>
          )}

          {canManageStatus && req.status === 'IN_PROGRESS' && (
            <div className="card space-y-2">
              <h3 className="text-sm font-medium text-white/70 mb-1">Provide Temporary Alternative</h3>
              <input className="input" placeholder="e.g. Library Printer 2" value={workaroundText} onChange={(e) => setWorkaroundText(e.target.value)} />
              <button className="btn-secondary w-full" disabled={busy || !workaroundText} onClick={doWorkaround}>Save Workaround</button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  )
}
