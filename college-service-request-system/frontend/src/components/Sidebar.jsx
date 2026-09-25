import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle, Bell, User, Users, Map,
  BarChart3, Settings, ClipboardList, ShieldCheck, Repeat,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requests', label: 'My Requests', icon: FileText },
    { to: '/requests/new', label: 'New Request', icon: PlusCircle },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  FACULTY: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requests', label: 'My Requests', icon: FileText },
    { to: '/requests/new', label: 'New Request', icon: PlusCircle },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  SERVICE_STAFF: [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/requests', label: 'Assigned Requests', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  SERVICE_LEAD: [
    { to: '/lead/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/lead/requests', label: 'All Requests', icon: FileText },
    { to: '/lead/heatmap', label: 'Campus Heatmap', icon: Map },
    { to: '/lead/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/lead/requests', label: 'All Requests', icon: FileText },
    { to: '/lead/heatmap', label: 'Campus Heatmap', icon: Map },
    { to: '/lead/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  const links = LINKS[user?.role] || []

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-navy-900/60 backdrop-blur-xl flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-accent-500/20 border border-accent-500/40 flex items-center justify-center shadow-glow">
          <Repeat className="w-5 h-5 text-accent-300" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">Nexus Institute</div>
          <div className="text-[11px] text-white/40 leading-tight">Service Desk</div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('dashboard')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 text-[11px] text-white/30 border-t border-white/5">
        CSR-2026 · Nexus Institute of Technology
      </div>
    </aside>
  )
}
