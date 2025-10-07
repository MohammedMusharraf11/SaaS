'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle, CheckCircle, Loader2, Users, MousePointerClick, Clock, Eye, Target, DollarSign, Search, FileText, BarChart3 } from 'lucide-react'

interface GoogleAnalyticsCardProps {
  userEmail?: string
}

export default function GoogleAnalyticsCard({ userEmail = 'test@example.com' }: GoogleAnalyticsCardProps) {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [searchConsoleData, setSearchConsoleData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState<'analytics' | 'search-console'>('analytics')

  const checkGoogleConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setGoogleConnected(data.connected || false)
      } else {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error checking Google connection:', error)
      setGoogleConnected(false)
    } finally {
      setCheckingConnection(false)
    }
  }

  const fetchUserAnalytics = async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`http://localhost:3010/api/analytics/data?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (data.dataAvailable) {
        setAnalyticsData(data)
        console.log('✅ Analytics data loaded:', data)
      } else {
        console.log('⚠️ No analytics data available:', data.reason)
        setAnalyticsData(null)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setAnalyticsData(null)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchSearchConsoleData = async () => {
    setLoadingData(true)
    try {
      // This would call your backend endpoint that fetches Search Console data
      const response = await fetch(`http://localhost:3010/api/search-console/data?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (data.dataAvailable) {
        setSearchConsoleData(data)
        console.log('✅ Search Console data loaded:', data)
      } else {
        console.log('⚠️ No search console data available:', data.reason)
        setSearchConsoleData(null)
      }
    } catch (error) {
      console.error('Error fetching search console data:', error)
      setSearchConsoleData(null)
    } finally {
      setLoadingData(false)
    }
  }

  const connectGoogleAnalytics = () => {
    setGoogleLoading(true)
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(userEmail)}`
  }

  const disconnectGoogleAnalytics = async () => {
    setGoogleLoading(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST'
      })
      if (response.ok) {
        setGoogleConnected(false)
        setAnalyticsData(null)
        setSearchConsoleData(null)
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    checkGoogleConnection()
    
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const errorParam = urlParams.get('error')
    
    if (success) {
      setGoogleConnected(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (errorParam) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Fetch data when connected
  useEffect(() => {
    if (googleConnected && !loadingData) {
      if (activeTab === 'analytics' && !analyticsData) {
        fetchUserAnalytics()
      } else if (activeTab === 'search-console' && !searchConsoleData) {
        fetchSearchConsoleData()
      }
    }
  }, [googleConnected, activeTab])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Connect Google Analytics & Search Console
            </CardTitle>
          </div>
          {checkingConnection && (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
              googleConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {googleConnected ? 'Connected' : 'Not Connected'}
                </span>
                {googleConnected && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {googleConnected 
                  ? 'Your Google account is connected. Access Analytics and Search Console data.' 
                  : 'Connect your Google account to get deeper insights from Analytics and Search Console.'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          {googleConnected && (
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('search-console')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'search-console'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4" />
                Search Console
              </button>
            </div>
          )}

          {/* Data Display */}
          {googleConnected && (
            <>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-gray-600">Loading data...</span>
                </div>
              ) : (
                <>
                  {/* Google Analytics Tab */}
                  {activeTab === 'analytics' && (
                    <>
                      {analyticsData?.dataAvailable ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">Analytics Overview (Last 30 Days)</h4>
                            <button
                              onClick={fetchUserAnalytics}
                              className="text-xs text-primary hover:text-primary-600 font-medium"
                            >
                              Refresh
                            </button>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Active Users */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-600">Active Users</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(analyticsData.activeUsers || 0)}
                              </p>
                            </div>

                            {/* Sessions */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MousePointerClick className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-gray-600">Sessions</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(analyticsData.sessions || 0)}
                              </p>
                            </div>

                            {/* Bounce Rate */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                <span className="text-xs text-gray-600">Bounce Rate</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {((analyticsData.bounceRate || 0) * 100).toFixed(1)}%
                              </p>
                            </div>

                            {/* Avg Session Duration */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600">Avg Duration</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatDuration(analyticsData.avgSessionDuration || 0)}
                              </p>
                            </div>

                            {/* Page Views */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs text-gray-600">Page Views</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(analyticsData.pageViews || 0)}
                              </p>
                            </div>

                            {/* Conversions */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-pink-600" />
                                <span className="text-xs text-gray-600">Conversions</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(analyticsData.conversions || 0)}
                              </p>
                            </div>

                            {/* Revenue (if available) */}
                            {analyticsData.revenue > 0 && (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 col-span-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                  <span className="text-xs text-gray-600">Total Revenue</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(analyticsData.revenue)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Last Updated */}
                          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                            Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8 text-center">
                          <div>
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No analytics data available</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {analyticsData?.reason || 'Unable to fetch data'}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Google Search Console Tab */}
                  {activeTab === 'search-console' && (
                    <>
                      {searchConsoleData?.dataAvailable ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">Search Console Overview (Last 30 Days)</h4>
                            <button
                              onClick={fetchSearchConsoleData}
                              className="text-xs text-primary hover:text-primary-600 font-medium"
                            >
                              Refresh
                            </button>
                          </div>

                          {/* Search Console Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Total Clicks */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MousePointerClick className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-600">Total Clicks</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(searchConsoleData.totalClicks || 0)}
                              </p>
                            </div>

                            {/* Total Impressions */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-gray-600">Impressions</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(searchConsoleData.totalImpressions || 0)}
                              </p>
                            </div>

                            {/* Average CTR */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600">Avg CTR</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {((searchConsoleData.averageCTR || 0) * 100).toFixed(2)}%
                              </p>
                            </div>

                            {/* Average Position */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-orange-600" />
                                <span className="text-xs text-gray-600">Avg Position</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {(searchConsoleData.averagePosition || 0).toFixed(1)}
                              </p>
                            </div>
                          </div>

                          {/* Top Queries */}
                          {searchConsoleData.topQueries?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">Top Queries</h5>
                              <div className="space-y-2">
                                {searchConsoleData.topQueries.slice(0, 5).map((query: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{query.query}</p>
                                      <p className="text-xs text-gray-500">
                                        {query.clicks} clicks • {query.impressions} impressions
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                      #{query.position.toFixed(1)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Last Updated */}
                          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                            Last updated: {new Date(searchConsoleData.lastUpdated || Date.now()).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8 text-center">
                          <div>
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No search console data available</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {searchConsoleData?.reason || 'Unable to fetch data'}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Benefits List (when not connected) */}
          {!googleConnected && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Benefits of Connecting:
              </p>
              
              <div className="space-y-3">
                {/* Google Analytics Benefits */}
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Google Analytics
                  </p>
                  <ul className="space-y-1.5 ml-5">
                    {[
                      'Real-time traffic analytics',
                      'User behavior insights',
                      'Conversion tracking',
                      'Audience demographics'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Google Search Console Benefits */}
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Google Search Console
                  </p>
                  <ul className="space-y-1.5 ml-5">
                    {[
                      'Search performance metrics',
                      'Top performing queries',
                      'Click-through rates',
                      'Average search position'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {googleConnected ? (
              <Button
                onClick={disconnectGoogleAnalytics}
                disabled={googleLoading}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect Account'
                )}
              </Button>
            ) : (
              <Button
                onClick={connectGoogleAnalytics}
                disabled={googleLoading}
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Connect Google Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}