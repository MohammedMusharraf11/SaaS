'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Globe,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'

interface SEOPerformanceNewProps {
  user: any
}

export default function SEOPerformanceNew({ user }: SEOPerformanceNewProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [dateRange, setDateRange] = useState<'7days' | '30days'>('30days')
  const [searchConsoleData, setSearchConsoleData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)

  const userEmail = user?.email || 'test@example.com'

  // Check if Google services are connected
  const checkConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected || false)
        
        if (data.connected) {
          fetchSearchConsoleData()
        } else {
          setShowConnectModal(true)
        }
      } else {
        setIsConnected(false)
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error checking connection:', error)
      setIsConnected(false)
      setShowConnectModal(true)
    } finally {
      setCheckingConnection(false)
    }
  }

  // Fetch Search Console data
  const fetchSearchConsoleData = async () => {
    setLoadingData(true)
    try {
      const searchConsoleResponse = await fetch(
        `http://localhost:3010/api/search-console/data?email=${encodeURIComponent(userEmail)}`
      )
      const searchConsoleJson = await searchConsoleResponse.json()
      if (searchConsoleJson.dataAvailable) {
        setSearchConsoleData(searchConsoleJson)
        console.log('✅ Search Console data loaded:', searchConsoleJson)
      } else {
        setSearchConsoleData(null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Connect to Google
  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(userEmail)}`
  }

  // Disconnect from Google
  const handleDisconnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST'
      })
      if (response.ok) {
        setIsConnected(false)
        setSearchConsoleData(null)
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
    } finally {
      setConnecting(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Check for success callback
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    if (success) {
      setIsConnected(true)
      setShowConnectModal(false)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Refetch data when date range changes
  useEffect(() => {
    if (isConnected && !checkingConnection) {
      fetchSearchConsoleData()
    }
  }, [dateRange, isConnected])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%'
  }

  if (checkingConnection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO & Website Performance</h1>
            <p className="text-gray-600 mt-1">Monitor your website's SEO metrics and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            {isConnected && (
              <Button 
                variant="outline" 
                className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleDisconnect}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Connection Modal */}
        <Dialog open={showConnectModal && !isConnected} onOpenChange={setShowConnectModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">SEO & Website Performance</DialogTitle>
              <DialogDescription className="text-center pt-4">
                Connect your Google account to access Analytics and Search Console data
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
                size="lg"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Connect with Google Analytics 4
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                This will connect both Google Analytics and Search Console
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        {isConnected ? (
          <div className="space-y-6">
            {/* Top Metrics Row - Original Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Site Audit */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Site Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#10b981"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${82 * 3.52} ${100 * 3.52}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">82%</span>
                        <span className="text-sm text-gray-600">Good</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Errors</span>
                      <span className="text-red-600 font-semibold">63</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Warnings</span>
                      <span className="text-orange-500 font-semibold">1977</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Notices</span>
                      <span className="text-gray-500 font-semibold">125436</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Speed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Page Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${82 * 2.51} ${100 * 2.51}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">82%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">Desktop</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Good</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#f59e0b"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${54 * 2.51} ${100 * 2.51}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">54%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">Mobile</span>
                      </div>
                      <span className="text-xs text-orange-500 font-medium">At risk</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Backlink Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Backlink Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-green-600">+15,000</span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>Net change</span>
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="h-20">
                      <svg className="w-full h-full" viewBox="0 0 300 80">
                        <polyline
                          points="0,60 50,55 100,45 150,50 200,30 250,25 300,20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <div>
                        <div className="text-gray-600">Total</div>
                        <div className="font-semibold">85,000</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600">New: 20,000</div>
                        <div className="text-red-600">Lost: 5,000</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Tables Row - Original Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keyword Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Keyword Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Keyword</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Position</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Change</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Volume</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { keyword: 'email marketing', position: 11, change: 7, volume: '72K', difficulty: 27 },
                          { keyword: 'social media', position: 7, change: 1, volume: '135K', difficulty: 9 },
                          { keyword: 'marketing', position: 3, change: -4, volume: '57K', difficulty: 42 },
                          { keyword: 'digital marketing', position: 13, change: 5, volume: '46K', difficulty: 46 },
                          { keyword: 'newsletter', position: 28, change: -6, volume: '23K', difficulty: 52 },
                          { keyword: 'agency', position: 28, change: -4, volume: '17K', difficulty: 87 },
                        ].map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 text-sm">{item.keyword}</td>
                            <td className="py-3 px-2 text-sm text-center">{item.position}</td>
                            <td className="py-3 px-2 text-sm text-center">
                              <div className={`flex items-center justify-center gap-1 ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                <span>{Math.abs(item.change)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-center">{item.volume}</td>
                            <td className="py-3 px-2 text-sm text-center">
                              <span className={`${item.difficulty > 50 ? 'text-red-600' : item.difficulty > 30 ? 'text-orange-500' : 'text-green-600'}`}>
                                {item.difficulty}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full text-orange-600 border-orange-600 hover:bg-orange-50">
                      View Full Report →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Gap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Content Gap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Keyword</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Your site</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Site A</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Site B</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Site C</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { keyword: 'email marketing', your: 11, siteA: 7, siteB: null, siteC: null },
                          { keyword: 'social media', your: 7, siteA: 1, siteB: null, siteC: 9 },
                          { keyword: 'marketing', your: 3, siteA: null, siteB: null, siteC: null },
                          { keyword: 'digital marketing', your: 13, siteA: 5, siteB: null, siteC: 22 },
                          { keyword: 'newsletter', your: 28, siteA: 6, siteB: 3, siteC: null },
                          { keyword: 'agency', your: 28, siteA: 4, siteB: null, siteC: 7 },
                        ].map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 text-sm">{item.keyword}</td>
                            <td className="py-3 px-2 text-sm text-center">{item.your}</td>
                            <td className="py-3 px-2 text-sm text-center">{item.siteA || '-'}</td>
                            <td className="py-3 px-2 text-sm text-center">{item.siteB || '-'}</td>
                            <td className="py-3 px-2 text-sm text-center">{item.siteC || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full text-orange-600 border-orange-600 hover:bg-orange-50">
                      View Full Report →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NEW: Google Search Console Section */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Search Console Data</h2>
              
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-gray-600">Loading Search Console data...</span>
                </div>
              ) : searchConsoleData && searchConsoleData.dataAvailable ? (
                <div className="space-y-6">
                  {/* Search Console Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {formatNumber(searchConsoleData.totalClicks || 0)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Total Clicks</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {formatNumber(searchConsoleData.totalImpressions || 0)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Impressions</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {formatPercentage(searchConsoleData.averageCTR || 0)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Average CTR</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">
                            {(searchConsoleData.averagePosition || 0).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Avg Position</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Search Queries */}
                  {searchConsoleData.topQueries && searchConsoleData.topQueries.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">Top Search Queries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Query</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Clicks</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Impressions</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">CTR</th>
                                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Position</th>
                              </tr>
                            </thead>
                            <tbody>
                              {searchConsoleData.topQueries.slice(0, 10).map((item: any, index: number) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-2 text-sm font-medium">{item.query}</td>
                                  <td className="py-3 px-2 text-sm text-center">{item.clicks}</td>
                                  <td className="py-3 px-2 text-sm text-center">{formatNumber(item.impressions)}</td>
                                  <td className="py-3 px-2 text-sm text-center">
                                    <span className={`${item.ctr > 0.05 ? 'text-green-600' : 'text-orange-500'}`}>
                                      {formatPercentage(item.ctr)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-sm text-center">
                                    <span className={`${item.position <= 10 ? 'text-green-600 font-semibold' : item.position <= 20 ? 'text-orange-500' : 'text-red-600'}`}>
                                      {item.position.toFixed(1)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 text-center">
                          Data from last 30 days • Last updated: {new Date(searchConsoleData.lastUpdated || Date.now()).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600 font-medium">No Search Console Data Available</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Make sure your website is verified in Google Search Console
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Blurred placeholder when not connected
          <div className="relative">
            <div className="blur-sm pointer-events-none opacity-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Audit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Page Speed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Backlinks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

