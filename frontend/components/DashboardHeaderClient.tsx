'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Menu, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardHeaderProfileDropdownClient from './DashboardHeaderProfileDropdownClient'

interface DashboardHeaderClientProps {
  user: any
  onMenuClick: () => void
}

export default function DashboardHeaderClient({ user, onMenuClick }: DashboardHeaderClientProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Menu button + Page Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Right: Actions + User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Download Button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Download</span>
          </Button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Your name
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            {/* Mobile: Just avatar */}
            <div className="sm:hidden">
              <DashboardHeaderProfileDropdownClient user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}