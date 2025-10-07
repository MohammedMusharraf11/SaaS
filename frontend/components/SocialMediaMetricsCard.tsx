'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Share2, 
  AlertCircle, 
  Loader2, 
  Users, 
  MousePointerClick, 
  TrendingUp, 
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

interface SocialMediaMetricsCardProps {
  userEmail?: string
}

interface SocialSource {
  source: string
  users: number
  sessions: number
  pageViews: number
  conversions: number
  bounceRate: number
}

interface SocialData {
  dataAvailable: boolean
  totalSocialSessions: number
  totalSocialUsers: number
  totalSocialConversions: number
  socialConversionRate: number
  socialTrafficPercentage: number
  topSocialSources: SocialSource[]
  reason?: string
  lastUpdated?: string
}

export default function SocialMediaMetricsCard({ userEmail = 'test@example.com' }: SocialMediaMetricsCardProps) {
  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [connected, setConnected] = useState(false)

  const fetchSocialMetrics = async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`http://localhost:3010/api/analytics/social?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (data.dataAvailable) {
        setSocialData(data)
        setConnected(true)
        console.log('✅ Social media data loaded:', data)
      } else {
        console.log('⚠️ No social media data available:', data.reason)
        setSocialData(data)
        setConnected(data.connected || false)
      }
    } catch (error) {
      console.error('Error fetching social media data:', error)
      setSocialData({
        dataAvailable: false,
        totalSocialSessions: 0,
        totalSocialUsers: 0,
        totalSocialConversions: 0,
        socialConversionRate: 0,
        socialTrafficPercentage: 0,
        topSocialSources: [],
        reason: 'Failed to fetch data'
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchSocialMetrics()
  }, [userEmail])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
  }

  const getSocialIcon = (source: string) => {
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('facebook')) return <Facebook className="w-4 h-4 text-blue-600" />
    if (lowerSource.includes('twitter') || lowerSource.includes('x.com')) return <Twitter className="w-4 h-4 text-sky-500" />
    if (lowerSource.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-600" />
    if (lowerSource.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-700" />
    if (lowerSource.includes('youtube')) return <Youtube className="w-4 h-4 text-red-600" />
    if (lowerSource.includes('reddit')) return <MessageCircle className="w-4 h-4 text-orange-500" />
    if (lowerSource.includes('tiktok')) return <Share2 className="w-4 h-4 text-black" />
    return <Share2 className="w-4 h-4 text-gray-600" />
  }

  const getSocialColor = (source: string) => {
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('facebook')) return 'bg-blue-50 border-blue-200'
    if (lowerSource.includes('twitter') || lowerSource.includes('x.com')) return 'bg-sky-50 border-sky-200'
    if (lowerSource.includes('instagram')) return 'bg-pink-50 border-pink-200'
    if (lowerSource.includes('linkedin')) return 'bg-blue-50 border-blue-200'
    if (lowerSource.includes('youtube')) return 'bg-red-50 border-red-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Social Media Metrics
            </CardTitle>
          </div>
          {!connected && (
            <Badge variant="outline" className="text-xs">
              Requires Google Analytics
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading social metrics...</span>
            </div>
          ) : socialData?.dataAvailable ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Social Traffic Overview (Last 30 Days)</h4>
                <button
                  onClick={fetchSocialMetrics}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Refresh
                </button>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Social Users */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">Social Users</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(socialData.totalSocialUsers)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {socialData.socialTrafficPercentage.toFixed(1)}% of total
                  </p>
                </div>

                {/* Total Sessions */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointerClick className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Social Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(socialData.totalSocialSessions)}
                  </p>
                </div>

                {/* Conversions */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">Conversions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(socialData.totalSocialConversions)}
                  </p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-600">Conv. Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {socialData.socialConversionRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Top Social Sources */}
              {socialData.topSocialSources && socialData.topSocialSources.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Top Social Sources</h5>
                  <div className="space-y-2">
                    {socialData.topSocialSources.slice(0, 5).map((source, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${getSocialColor(source.source)}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getSocialIcon(source.source)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate capitalize">
                              {source.source}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span>{formatNumber(source.users)} users</span>
                              <span>•</span>
                              <span>{formatNumber(source.sessions)} sessions</span>
                              {source.conversions > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">
                                    {source.conversions} conversions
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-bold text-gray-900">
                            {formatNumber(source.pageViews)}
                          </p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                Last updated: {socialData.lastUpdated ? new Date(socialData.lastUpdated).toLocaleString() : 'N/A'}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No social media data available</p>
                <p className="text-xs text-gray-500 mt-1">
                  {socialData?.reason || 'Connect Google Analytics to view social traffic'}
                </p>
                {!connected && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg text-left">
                    <p className="text-xs font-semibold text-purple-900 mb-2">💡 To view social metrics:</p>
                    <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
                      <li>Connect your Google Analytics account</li>
                      <li>Ensure your website tracks social traffic</li>
                      <li>Wait for data to accumulate (24-48 hours)</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}