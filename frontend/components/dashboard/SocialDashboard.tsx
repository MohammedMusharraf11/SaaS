'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, 
  Loader2, 
  ArrowRight
} from 'lucide-react'

// --- Interface Definitions ---
interface SocialMediaMetricsCardProps {
  userEmail?: string
}

interface TopPost {
  format: string
  reach: string
  likes: string
  comments: string
  shares: string
  message?: string
  url?: string
}

interface FollowerGrowthData {
  date: string
  followers: number
  gained: number
  lost: number
  net: number
}

interface FacebookMetrics {
  dataAvailable: boolean
  pageName?: string
  pageId?: string
  engagementScore?: {
    likes: number
    comments: number
    shares: number
    engagementRate: number
    reach: number
  }
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
  }
  reason?: string
  lastUpdated?: string
}

interface LinkedInMetrics {
  dataAvailable: boolean
  companyName?: string
  companyUrl?: string
  companyFollowers?: number
  source?: string
  scrapedPostsCount?: number
  engagementScore?: {
    likes: number
    comments: number
    shares: number
    engagementRate: number
    reach: number
  }
  followerGrowth?: FollowerGrowthData[]
  topPosts?: TopPost[]
  allPosts?: TopPost[]
  reputationBenchmark?: {
    score: number
    followers: number
    avgEngagementRate: number
    sentiment: string
    avgEngagementPerPost?: number
  }
  reason?: string
  lastUpdated?: string
}

interface SocialData {
  dataAvailable: boolean
  totalSocialSessions: number
  totalSocialUsers: number
  totalSocialConversions: number
  socialConversionRate: number
  socialTrafficPercentage: number
  topSocialSources: any[]
  reason?: string
  lastUpdated?: string
}

// --- Main Component ---
export default function SocialMediaMetricsContent({ userEmail = 'test@example.com' }: SocialMediaMetricsCardProps) {
  const [socialData, setSocialData] = useState<SocialData | null>(null)
  const [facebookData, setFacebookData] = useState<FacebookMetrics | null>(null)
  const [linkedinData, setLinkedinData] = useState<LinkedInMetrics | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [connected, setConnected] = useState(false)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [network, setNetwork] = useState<'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'all'>('facebook')
  // Modal state
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [savingLinkedin, setSavingLinkedin] = useState(false)
  // State for client-side random data to prevent Hydration Error
  const [followerGrowthData, setFollowerGrowthData] = useState<any[]>([]);

  // --- Functions ---
  const checkFacebookConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/facebook/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setConnected(data.connected || false)
        console.log('✅ Facebook connection status:', data.connected)
      } else {
        setConnected(false)
      }
    } catch (error) {
      console.error('Error checking Facebook connection:', error)
      setConnected(false)
    } finally {
      setCheckingConnection(false)
    }
  }

  const checkLinkedInConnection = async () => {
    try {
      const response = await fetch(`http://localhost:3010/api/linkedin/organizations?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setLinkedinConnected(data.connected || false)
        if (data.connected && data.companyUrl) {
          setLinkedinUrl(data.companyUrl)
          console.log('✅ LinkedIn company URL found:', data.companyUrl)
        }
      } else {
        setLinkedinConnected(false)
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error)
      setLinkedinConnected(false)
    }
  }

  const fetchSocialMetrics = async () => {
    if (!connected && network === 'facebook') {
      console.log('Not connected to Facebook, skipping metrics fetch')
      return
    }

    if (!linkedinConnected && network === 'linkedin') {
      console.log('No LinkedIn URL saved, skipping metrics fetch')
      return
    }

    setLoadingData(true)
    try {
      if (network === 'facebook' && connected) {
        await fetchFacebookMetrics()
      } else if (network === 'linkedin' && linkedinConnected) {
        await fetchLinkedInMetrics()
      }
    } finally {
      setLoadingData(false)
    }
  }

  const fetchFacebookMetrics = async () => {
    try {
      const periodMap = {
        '7d': 'week',
        '30d': 'month',
        '90d': 'month'
      }
      
      const response = await fetch(
        `http://localhost:3010/api/facebook/metrics?email=${encodeURIComponent(userEmail)}&period=${periodMap[timeframe]}`
      )
      
      const data = await response.json()
      
      if (data.dataAvailable) {
        setFacebookData(data)
        
        // Also set socialData for backward compatibility
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: data.engagementScore?.reach || 0,
          totalSocialUsers: data.reputationBenchmark?.followers || 0,
          totalSocialConversions: data.engagementScore?.shares || 0,
          socialConversionRate: data.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: data.lastUpdated
        })
        console.log('✅ Facebook data loaded:', data)
      } else {
        console.log('⚠️ No Facebook data available:', data.reason)
        setFacebookData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: data.reason || 'Failed to fetch data'
        })
      }
    } catch (error) {
      console.error('Error fetching Facebook metrics:', error)
      setFacebookData(null)
    }
  }

  const fetchLinkedInMetrics = async () => {
    try {
      const response = await fetch(
        `http://localhost:3010/api/linkedin/metrics?email=${encodeURIComponent(userEmail)}`
      )
      
      const data = await response.json()
      
      if (data.dataAvailable) {
        setLinkedinData(data)
        
        // Also set socialData for backward compatibility
        setSocialData({
          dataAvailable: true,
          totalSocialSessions: data.engagementScore?.reach || 0,
          totalSocialUsers: data.reputationBenchmark?.followers || data.companyFollowers || 0,
          totalSocialConversions: data.engagementScore?.shares || 0,
          socialConversionRate: data.engagementScore?.engagementRate || 0,
          socialTrafficPercentage: 0.25,
          topSocialSources: [],
          lastUpdated: data.lastUpdated
        })
        console.log('✅ LinkedIn data loaded:', data)
      } else {
        console.log('⚠️ No LinkedIn data available:', data.reason)
        setLinkedinData(null)
        setSocialData({
          dataAvailable: false,
          totalSocialSessions: 0,
          totalSocialUsers: 0,
          totalSocialConversions: 0,
          socialConversionRate: 0,
          socialTrafficPercentage: 0,
          topSocialSources: [],
          reason: data.reason || 'Failed to fetch data'
        })
      }
    } catch (error) {
      console.error('Error fetching LinkedIn metrics:', error)
      setLinkedinData(null)
    }
  }

  const connectFacebook = () => {
    window.location.href = `http://localhost:3010/api/auth/facebook?email=${encodeURIComponent(userEmail)}`
  }

  const disconnectFacebook = async () => {
    try {
      const response = await fetch(
        `http://localhost:3010/api/auth/facebook/disconnect?email=${encodeURIComponent(userEmail)}`,
        { method: 'POST' }
      )
      
      if (response.ok) {
        setConnected(false)
        setFacebookData(null)
        setSocialData(null)
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error disconnecting Facebook:', error)
    }
  }

  const saveLinkedInUrl = async () => {
    if (!linkedinUrl.trim()) {
      alert('Please enter a LinkedIn company URL')
      return
    }

    setSavingLinkedin(true)
    try {
      const response = await fetch('http://localhost:3010/api/linkedin/save-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          companyUrl: linkedinUrl
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setLinkedinConnected(true)
        setShowConnectModal(false)
        console.log('✅ LinkedIn URL saved:', linkedinUrl)
        // Fetch metrics immediately
        await fetchLinkedInMetrics()
      } else {
        alert(data.error || 'Failed to save LinkedIn URL')
      }
    } catch (error) {
      console.error('Error saving LinkedIn URL:', error)
      alert('Failed to save LinkedIn URL')
    } finally {
      setSavingLinkedin(false)
    }
  }

  const disconnectLinkedIn = async () => {
    try {
      const response = await fetch(
        `http://localhost:3010/api/linkedin/disconnect?email=${encodeURIComponent(userEmail)}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        setLinkedinConnected(false)
        setLinkedinData(null)
        setLinkedinUrl('')
        setSocialData(null)
        setShowConnectModal(true)
      }
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return Math.round(num).toString()
  }

  const computeEngagementScore = useMemo(() => {
    // Check which platform is selected
    if (network === 'facebook' && facebookData?.dataAvailable && facebookData.engagementScore) {
      const engagementRate = facebookData.engagementScore.engagementRate || 0
      const hasActivity = (facebookData.engagementScore.likes || 0) + 
                          (facebookData.engagementScore.comments || 0) + 
                          (facebookData.engagementScore.shares || 0) > 0
      return hasActivity ? Math.min(100, Math.round(engagementRate * 10)) : 0
    }
    
    if (network === 'linkedin' && linkedinData?.dataAvailable && linkedinData.engagementScore) {
      const engagementRate = linkedinData.engagementScore.engagementRate || 0
      const hasActivity = (linkedinData.engagementScore.likes || 0) + 
                          (linkedinData.engagementScore.comments || 0) + 
                          (linkedinData.engagementScore.shares || 0) > 0
      return hasActivity ? Math.min(100, Math.round(engagementRate * 10)) : 0
    }
    
    return 0
  }, [facebookData, linkedinData, network])

  const getNetworkStats = useMemo(() => {
    // Use real Facebook data if available
    if (network === 'facebook' && facebookData?.dataAvailable && facebookData.engagementScore) {
      const engagement = facebookData.engagementScore
      return {
        likes: (engagement.likes / 1000) || 0,
        comments: (engagement.comments / 1000) || 0,
        shares: (engagement.shares / 1000) || 0,
        engagementRate: engagement.engagementRate || 0,
        reach: engagement.reach || 0
      }
    }

    // Use real LinkedIn data if available
    if (network === 'linkedin' && linkedinData?.dataAvailable && linkedinData.engagementScore) {
      const engagement = linkedinData.engagementScore
      return {
        likes: (engagement.likes / 1000) || 0,
        comments: (engagement.comments / 1000) || 0,
        shares: (engagement.shares / 1000) || 0,
        engagementRate: engagement.engagementRate || 0,
        reach: engagement.reach || 0
      }
    }
    
    // Fallback for other networks or when no data
    const engagementScore = computeEngagementScore
    const baseReach = facebookData?.reputationBenchmark?.followers || 
                     linkedinData?.reputationBenchmark?.followers || 
                     socialData?.totalSocialUsers || 0
    
    const stats = {
      linkedin: { likes: 0, comments: 0, shares: 0, engagementRate: 0, reach: baseReach },
      facebook: { likes: 0, comments: 0, shares: 0, engagementRate: engagementScore, reach: baseReach },
      instagram: { likes: 0, comments: 0, shares: 0, engagementRate: 0, reach: baseReach },
      twitter: { likes: 0, comments: 0, shares: 0, engagementRate: 0, reach: baseReach },
      all: { likes: 0, comments: 0, shares: 0, engagementRate: engagementScore, reach: baseReach }
    }
    
    return stats[network]
  }, [network, facebookData, linkedinData, socialData, computeEngagementScore])
  
  const networkStats = getNetworkStats

  const calculateFollowerGrowthData = (currentNetwork: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'all') => {
      // Use real Facebook follower growth data if available
      if (currentNetwork === 'facebook' && facebookData?.followerGrowth && facebookData.followerGrowth.length > 0) {
        return facebookData.followerGrowth.map((item, index) => ({
          value: item.followers,
          label: index
        }))
      }
      
      // Use real LinkedIn follower growth data if available
      if (currentNetwork === 'linkedin' && linkedinData?.followerGrowth && linkedinData.followerGrowth.length > 0) {
        return linkedinData.followerGrowth.map((item, index) => ({
          value: item.followers,
          label: index
        }))
      }
      
      // Fallback to mock data for other networks
      const baseMultiplier = {
          linkedin: 1.0, facebook: 1.5, instagram: 2.0, twitter: 0.8, all: 1.2
      }[currentNetwork];
      
      const data = [];
      let currentValue = 100;
      
      for (let i = 0; i < 12; i++) {
          const change = (Math.random() * 50 - 20) * baseMultiplier;
          currentValue = Math.max(currentValue + change, 50);
          data.push({
              value: Math.round(currentValue),
              label: i
          });
      }
      return data;
  };
  
  useEffect(() => {
    // Check both connections on mount
    checkFacebookConnection()
    checkLinkedInConnection()
    
    // Check for OAuth callback success/error
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success) {
      setConnected(true)
      setShowConnectModal(false)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      console.error('OAuth error:', error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    // Fetch metrics when connection state changes or network changes
    if (network === 'facebook' && connected && !loadingData) {
      fetchFacebookMetrics()
    } else if (network === 'linkedin' && linkedinConnected && !loadingData) {
      fetchLinkedInMetrics()
    }
  }, [connected, linkedinConnected, timeframe, network])

  useEffect(() => {
    setFollowerGrowthData(calculateFollowerGrowthData(network));
  }, [network, facebookData, linkedinData]);

  // Handle network change - show modal if platform not connected
  useEffect(() => {
    if (network === 'facebook' && !connected && !checkingConnection) {
      setShowConnectModal(true)
    } else if (network === 'linkedin' && !linkedinConnected && !checkingConnection) {
      setShowConnectModal(true)
    } else {
      setShowConnectModal(false)
    }
  }, [network, connected, linkedinConnected, checkingConnection])

  // --- JSX Rendering (Content Only) ---
  return (
    <div className="p-8 space-y-6 relative">
      {/* Blurred Modal for Connect Facebook/LinkedIn */}
  {showConnectModal && ((network === 'facebook' && !connected) || (network === 'linkedin' && !linkedinConnected)) && !checkingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto text-center relative">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {network === 'facebook' ? 'Connect Facebook' : 'Connect LinkedIn'}
            </h2>
            <p className="text-gray-500 mb-6">
              {network === 'facebook' 
                ? 'To view your Facebook metrics, please connect your Facebook account.' 
                : 'To view your LinkedIn metrics, please enter your LinkedIn company URL.'}
            </p>
            
            {network === 'facebook' && (
              <div className="flex flex-col gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={connectFacebook}>
                  Connect Facebook
                </Button>
              </div>
            )}
            
            {network === 'linkedin' && (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/company/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  className="bg-blue-800 hover:bg-blue-900 text-white" 
                  onClick={saveLinkedInUrl}
                  disabled={savingLinkedin || !linkedinUrl}
                >
                  {savingLinkedin ? 'Saving...' : 'Save & Fetch Metrics'}
                </Button>
              </div>
            )}
            
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowConnectModal(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
      
  {/* Filters Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
          >
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="all">All Platforms</option>
          </select>
        </div>

        {((network === 'facebook' && connected) || (network === 'linkedin' && linkedinConnected)) && (
          <Button 
            variant="outline" 
            onClick={network === 'facebook' ? disconnectFacebook : disconnectLinkedIn}
            className="text-sm text-red-600 border-red-300 hover:bg-red-50"
          >
            Disconnect {network === 'facebook' ? 'Facebook' : 'LinkedIn'}
          </Button>
        )}
      </div>
      
      {loadingData ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-3 text-gray-600">Loading social metrics...</span>
        </div>
      ) : socialData?.dataAvailable ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* A. Engagement Score & Follower Growth (Row 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Engagement Score Card */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-lg font-bold text-gray-900">Engagement Score</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4 flex items-center justify-center space-x-4">
                  {/* Score Circle */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    {(() => {
                      const score = computeEngagementScore
                      const radius = 50
                      const circumference = 2 * Math.PI * radius
                      const progress = (score / 100) * circumference
                      return (
                        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#FEE2E2" strokeWidth="10" />
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="10"
                            strokeDasharray={`${progress} ${circumference - progress}`}
                            strokeLinecap="round"
                          />
                          <text x="60" y="60" textAnchor="middle" className="fill-gray-900 rotate-90" fontSize="26" fontWeight="700" transform="rotate(90 60 60)">{score}%</text>
                          <text x="60" y="78" textAnchor="middle" className="fill-gray-500 rotate-90" fontSize="10" transform="rotate(90 60 60)">Above Avg</text>
                        </svg>
                      )
                    })()}
                  </div>
                  {/* Key Metrics */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Likes</span>
                        <span className="font-semibold">{networkStats.likes}K</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Comments</span>
                        <span className="font-semibold">{networkStats.comments}K</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Shares</span>
                        <span className="font-semibold">{networkStats.shares}K</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-gray-500 border-t border-gray-100">
                        <span className="text-xs">Engagement Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{networkStats.engagementRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Follower Growth Card (Chart) */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-lg font-bold text-gray-900">Follower Growth</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  {followerGrowthData.length > 0 ? (
                    <div className="h-40 relative">
                      <svg viewBox="0 0 300 120" className="w-full h-full">
                        {/* Grid lines */}
                        {[0, 30, 60, 90, 120].map((y, i) => (
                          <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                        ))}
                        
                        {/* Y-axis labels */}
                        <text x="5" y="15" fontSize="8" fill="#9CA3AF" textAnchor="start">300</text>
                        <text x="5" y="70" fontSize="8" fill="#9CA3AF" textAnchor="start">150</text>

                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={followerGrowthData.map((d, i) => {
                            const x = 20 + (i / (followerGrowthData.length - 1)) * 280
                            const y = 120 - (d.value / 350) * 120
                            return `${x},${y}`
                          }).join(' ')}
                        />
                      </svg>
                      <div className="absolute bottom-0 w-full flex justify-between px-5 text-xs text-gray-400">
                          <span>1/25</span>
                          <span>10/25</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* B. Top Performing Posts (Row 2) */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Top Performing Post</h3>
                  <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                    View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Format</th>
                        <th className="pb-3 font-medium text-right">Reach</th>
                        <th className="pb-3 font-medium text-right">Likes</th>
                        <th className="pb-3 font-medium text-right">Comments</th>
                        <th className="pb-3 font-medium text-right">Shares</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900">
                      {(() => {
                        const currentData = network === 'facebook' ? facebookData : linkedinData;
                        return currentData?.topPosts && currentData.topPosts.length > 0 ? (
                          currentData.topPosts.map((post, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0">
                              <td className="py-3 font-medium">{post.format}</td>
                              <td className="py-3 text-right">{post.reach}</td>
                              <td className="py-3 text-right">{post.likes}</td>
                              <td className="py-3 text-right">{post.comments}</td>
                              <td className="py-3 text-right">{post.shares}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-400 text-sm">
                              No posts available yet. Start posting to see engagement data!
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* C. Competitor Comparison */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Competitor Comparison</h3>
                
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-no-repeat bg-[length:14px_14px] bg-[right_10px_center]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M7%2010l5%205l5-5H7z%22%2F%3E%3C%2Fsvg%3E\")" }}
                >
                    <option>Competitor A</option>
                    <option>Competitor B</option>
                </select>
                
                <div className="space-y-4">
                  {/* Your Account */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Y</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Your Account</p>
                        <p className="text-xs text-gray-500">Reach: {formatNumber(networkStats.reach)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">Engagement: 27K</span>
                  </div>
                  
                  {/* Competitor A */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">A</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Competitor A</p>
                        <p className="text-xs text-gray-500">Reach: 100K</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Engagement: 27K</span>
                  </div>
                  
                  {/* Competitor B */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">B</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Competitor B</p>
                        <p className="text-xs text-gray-500">Reach: 3592</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Engagement: 2.1K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* D. Reputation Benchmark */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reputation Benchmark</h3>
                
                <div className="flex flex-col items-center gap-4">
                  <svg viewBox="0 0 240 200" className="w-full" style={{ maxWidth: '280px' }}>
                    {/* Pentagon background layers */}
                    <polygon points="120,25 200,75 175,160 65,160 40,75" fill="#FFFBEB" stroke="#FEF3C7" strokeWidth="1.5" />
                    <polygon points="120,50 185,87 165,145 75,145 55,87" fill="none" stroke="#FDE68A" strokeWidth="1" />
                    <polygon points="120,75 170,99 155,130 85,130 70,99" fill="none" stroke="#FCD34D" strokeWidth="1" />
                    
                    {/* Data pentagon (orange fill) */}
                    {(() => {
                      // Calculate scores from real platform data (Facebook or LinkedIn)
                      const calculateReputationScores = () => {
                        const currentData = network === 'facebook' ? facebookData : linkedinData;
                        
                        if (!currentData || !currentData.engagementScore) {
                          return [50, 50, 50, 50, 50]; // Default neutral scores
                        }

                        const engagement = currentData.engagementScore;
                        
                        // 1. Review Score (based on engagement rate)
                        const reviewScore = Math.min(100, engagement.engagementRate * 10);
                        
                        // 2. Brand Mentions (based on likes/reactions)
                        const brandScore = engagement.likes > 0 ? Math.min(100, (engagement.likes / 100) * 100) : 50;
                        
                        // 3. Consistency (based on post frequency)
                        const consistencyScore = currentData.topPosts && currentData.topPosts.length > 0 
                          ? Math.min(100, (currentData.topPosts.length / 10) * 100) 
                          : 50;
                        
                        // 4. Responsiveness (based on comments - indicates interaction)
                        const responsivenessScore = engagement.comments > 0 
                          ? Math.min(100, (engagement.comments / 50) * 100) 
                          : 50;
                        
                        // 5. Engagement Quality (based on shares and overall engagement)
                        const engagementQuality = engagement.shares > 0 
                          ? Math.min(100, (engagement.shares / 20) * 100) 
                          : Math.min(100, engagement.engagementRate * 8);

                        return [reviewScore, brandScore, consistencyScore, responsivenessScore, engagementQuality];
                      };

                      const scores = calculateReputationScores();
                      const centerX = 120
                      const centerY = 100
                      const maxRadius = 70
                      
                      // Pentagon points (starting from top, going clockwise)
                      const angles = [
                          -Math.PI / 2,           // Top (Review Score)
                          -Math.PI / 2 + (2 * Math.PI / 5),     // Top-right (Brand Mentions)
                          -Math.PI / 2 + (4 * Math.PI / 5),     // Bottom-right (Consistency)
                          -Math.PI / 2 + (6 * Math.PI / 5),     // Bottom-left (Responsiveness)
                          -Math.PI / 2 + (8 * Math.PI / 5),     // Top-left (Engagement Quality)
                      ]
                      
                      const points = scores.map((score, i) => {
                          const normalizedScore = score / 100
                          const r = maxRadius * normalizedScore
                          const x = centerX + r * Math.cos(angles[i])
                          const y = centerY + r * Math.sin(angles[i])
                          return `${x},${y}`
                      }).join(' ')

                      return <polygon points={points} fill="#FB923C" opacity="0.7" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" />
                    })()}
                    
                    {/* Labels positioned around pentagon */}
                    <text x="120" y="18" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Review Score®</text>
                    <text x="208" y="80" textAnchor="start" fontSize="11" fill="#6B7280" fontWeight="600">Brand Mentions®</text>
                    <text x="182" y="175" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Consistency®</text>
                    <text x="58" y="175" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="600">Responsiveness®</text>
                    <text x="32" y="80" textAnchor="end" fontSize="11" fill="#6B7280" fontWeight="600">Engagement Quality®</text>
                  </svg>
                  
                  <div className="text-center mt-2">
                    <p className="text-5xl font-extrabold text-orange-600">
                      {(() => {
                        const currentData = network === 'facebook' ? facebookData : linkedinData;
                        return currentData?.reputationBenchmark?.score 
                          ? `${currentData.reputationBenchmark.score}%`
                          : '50%';
                      })()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Overall Score</p>
                  </div>
                  
                  <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 mt-2">
                    View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Error/Not Connected State */
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No social media data available</h3>
            <p className="text-sm text-gray-500 mb-6">
              {socialData?.reason || 'Connect your platform account to view social metrics'}
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6">
              Connect Platform
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}