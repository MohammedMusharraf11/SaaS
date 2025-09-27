'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, BarChart3, Search, Share2, Users, Target, FileText, Globe, TrendingUp, Settings } from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
  submenu?: string[]
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
    submenu: ['Traffic Overview', 'Sources', 'Behavior', 'Conversions']
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: <Share2 className="h-5 w-5" />,
    submenu: ['Social Analytics', 'Engagement', 'Social Listening']
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: <FileText className="h-5 w-5" />,
    submenu: ['My Projects', 'Create Project', 'Project Templates']
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: <Target className="h-5 w-5" />,
    submenu: ['Report Builder', 'Scheduled Reports', 'Export Data']
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    submenu: ['Account', 'Notifications', 'Integrations', 'Billing']
  }
]

export default function DashboardSidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['overview'])

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <div className="w-72 bg-slate-900 text-white h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Analytics</h2>
          </div>
          <p className="text-slate-400 text-sm">Digital Marketing Platform</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  expandedItems.includes(item.id) 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={expandedItems.includes(item.id) ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">
                    {item.title}
                  </span>
                </div>
                {item.submenu && (
                  expandedItems.includes(item.id) ? (
                    <ChevronDown className="h-4 w-4 text-white" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )
                )}
              </button>
              
              {item.submenu && expandedItems.includes(item.id) && (
                <div className="ml-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Free Plan</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Upgrade to unlock advanced features</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
