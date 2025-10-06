'use client'

import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeaderClient from './DashboardHeaderClient'
import DashboardContent from './DashboardContent'

interface DashboardLayoutProps {
  user: any
}

export default function DashboardLayout({ user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'}
          w-80
        `}
      >
        <DashboardSidebar 
          onClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeaderClient 
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onDownloadReport={() => {
            alert('Please go to SEO & Website Performance page to analyze and download reports.')
          }}
        />
        <DashboardContent 
          userEmail={user?.email}
          userName={user?.user_metadata?.full_name || user?.user_metadata?.name}
        />
      </div>
    </div>
  )
}