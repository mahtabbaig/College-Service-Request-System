import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
