import React, { useEffect, useState } from 'react'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listNotifications } from '../services/api'

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    listNotifications().then((res) => {
      if (mounted) setUnread(res.data.unread_count)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-navy-950/70 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
        >
          <Bell className="w-4 h-4 text-white/70" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
              {unread}
            </span>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <div className="w-7 h-7 rounded-full bg-accent-500/30 flex items-center justify-center text-xs font-semibold text-accent-200">
              {user?.name?.[0] || '?'}
            </div>
            <span className="text-sm text-white/80">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-lg p-1.5 shadow-card">
              <div className="px-3 py-2 text-xs text-white/40">{user?.role?.replace('_', ' ')}</div>
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-md"
              >
                Profile
              </button>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-3 py-2 text-sm text-rose-300 hover:bg-white/5 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
