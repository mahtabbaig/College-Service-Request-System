import React from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return (
    <AppLayout title="Profile" subtitle="Your account details">
      <div className="card max-w-lg space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent-500/30 flex items-center justify-center text-xl font-semibold text-accent-200">
            {user?.name?.[0]}
          </div>
          <div>
            <div className="text-white font-medium">{user?.name}</div>
            <div className="text-sm text-white/40">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white/80">{user?.email}</span></div>
          {user?.department && <div className="flex justify-between"><span className="text-white/40">Department</span><span className="text-white/80">{user.department}</span></div>}
          {user?.phone && <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white/80">{user.phone}</span></div>}
          <div className="flex justify-between"><span className="text-white/40">Member since</span><span className="text-white/80">{user?.created_at
  ? new Date(user.created_at).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  : '—'}</span></div>
        </div>
      </div>
    </AppLayout>
  )
}
