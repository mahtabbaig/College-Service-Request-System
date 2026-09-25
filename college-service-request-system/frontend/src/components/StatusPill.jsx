import React from 'react'

const STATUS_STYLES = {
  NEW: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  ASSIGNED: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  ON_HOLD: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  CLOSED: 'bg-white/10 text-white/60 border border-white/15',
  REOPENED: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
}

const PRIORITY_STYLES = {
  LOW: 'bg-white/10 text-white/60 border border-white/15',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  CRITICAL: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
}

const SLA_STYLES = {
  WITHIN_SLA: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  APPROACHING_SLA: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  SLA_BREACHED: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
}

export function StatusPill({ status }) {
  return <span className={`pill ${STATUS_STYLES[status] || 'bg-white/10 text-white/70'}`}>{status?.replace('_', ' ')}</span>
}

export function PriorityPill({ priority }) {
  return <span className={`pill ${PRIORITY_STYLES[priority] || 'bg-white/10 text-white/70'}`}>{priority}</span>
}

export function SlaPill({ slaStatus }) {
  const label = { WITHIN_SLA: 'Within SLA', APPROACHING_SLA: 'Approaching SLA', SLA_BREACHED: 'SLA Breached' }[slaStatus] || slaStatus
  return <span className={`pill ${SLA_STYLES[slaStatus] || 'bg-white/10 text-white/70'}`}>{label}</span>
}
