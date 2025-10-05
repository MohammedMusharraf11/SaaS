'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, BarChart3, Search, Share2, Users, Target, FileText, Globe, TrendingUp, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
  submenu?: string[]
}

interface DashboardSidebarProps {
  onClose?: () => void
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    title: 'Dashboard Overview',
    icon: <BarChart3 className="h-5 w-5" />,
    submenu: ['Overview', 'Health Score', 'Quick Actions']
  },
  {
    id: 'seo',
    title: 'SEO Tools',
    icon: <Search className="h-5 w-5" />,
    submenu: ['Keyword Research', 'Site Audit', 'Rankings', 'Backlinks']
  },
  {
    id: 'competitors',
    title: 'Competitor Analysis',
    icon: <Users className="h-5 w-5" />,
    submenu: ['Competitor Overview', 'Domain Comparison', 'Market Share']
  },
  {
    id: 'traffic',
    title: 'Traffic Analytics',
    icon: <TrendingUp className="h-5 w-5" />,
    submenu: ['Traffic Sources', 'Geographic Data', 'Audience Insights']
  },
  {
    id: 'content',
    title: 'Content Performance',
    icon: <FileText className="h-5 w-5" />,
    submenu: ['Top Pages', 'Content Gap', 'Optimization']
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: <Share2 className="h-5 w-5" />,
    submenu: ['Social Insights', 'Engagement', 'Shares']
  },
  {
    id: 'local',
    title: 'Local SEO',
    icon: <Target className="h-5 w-5" />,
    submenu: ['Local Rankings', 'Citations', 'Reviews']
  },
  {
    id: 'international',
    title: 'International SEO',
    icon: <Globe className="h-5 w-5" />,
    submenu: ['Geo-targeting', 'Hreflang', 'International Rankings']
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    submenu: ['Account', 'Integrations', 'API', 'Billing']
  }
]

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>(['overview'])
  const router = useRouter()

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleUpgradeClick = () => {
    router.push('/subscribe')
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Logo - hidden on mobile when sidebar is overlay */}
        <div className="mb-6 sm:mb-8 hidden lg:block">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            SEO Dashboard
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => toggleMenu(item.id)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <span className="flex items-center space-x-2 sm:space-x-3">
                  {item.icon}
                  <span>{item.title}</span>
                </span>
                {item.submenu && (
                  openMenus.includes(item.id) 
                    ? <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    : <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
              
              {item.submenu && openMenus.includes(item.id) && (
                <div className="mt-1 ml-6 sm:ml-8 space-y-1">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      className="block w-full text-left px-3 sm:px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        
        <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Free Plan</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Upgrade to unlock advanced features</p>
            <button 
              onClick={handleUpgradeClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
