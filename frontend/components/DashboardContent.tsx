'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2, 
  Globe,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Download,
  ExternalLink,
  Info
} from 'lucide-react'
// Removed imports: GoogleAnalyticsCard and SocialMediaMetricsCard (keeping them safe for later use)
// import GoogleAnalyticsCard from './GoogleAnalyticsCard'
// import SocialMediaMetricsCard from './SocialMediaMetricsCard'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface DashboardContentProps {
  userEmail?: string
  userName?: string
}

interface TrafficData {
  source: string
  data: Array<{
    date: string
    day: number
    visitors: number
    sessions: number
    pageViews: number
  }>
  summary: {
    totalVisitors: number
    avgDailyVisitors: number
    trend: 'up' | 'down' | 'stable'
    changePercent: number
  }
}

export default function DashboardContent({ userEmail, userName }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'website' | 'seo' | 'social'>('website')
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState<any>(null)
  const [lighthouseData, setLighthouseData] = useState<any>(null)
  const [error, setError] = useState('')
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [loadingTraffic, setLoadingTraffic] = useState(false)
  const [userEmailState, setUserEmailState] = useState<string | null>(null)
  const [isGAConnected, setIsGAConnected] = useState<boolean | null>(null)

  // Competitor quick-analyze state
  const [competitorDomainInput, setCompetitorDomainInput] = useState<string>('')
  const [competitorResults, setCompetitorResults] = useState<any>(null)
  const [loadingCompetitor, setLoadingCompetitor] = useState(false)

  // Extract first name
  const getDisplayName = () => {
    if (userName) {
      return userName.split(' ')[0]
    } else if (userEmail) {
      const emailName = userEmail.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    return 'User'
  }

  const analyzeWebsite = async () => {
    if (!url) return

    setAnalyzing(true)
    setError('')
    setHealthScore(null)
    setLighthouseData(null)
    setTrafficData(null)

    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

      // Fetch health score
      const healthResponse = await fetch('http://localhost:3010/api/health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanUrl })
      })

      if (!healthResponse.ok) throw new Error('Failed to analyze website')

      const healthData = await healthResponse.json()
      setHealthScore(healthData)

      // Fetch Lighthouse data
      try {
        const lighthouseResponse = await fetch(`http://localhost:3010/api/lighthouse/${cleanUrl}`)
        if (lighthouseResponse.ok) {
          const lighthouseJson = await lighthouseResponse.json()
          setLighthouseData(lighthouseJson)
        }
      } catch (err) {
        console.warn('Lighthouse data not available')
      }

      // Fetch traffic data
      console.log('🔍 About to fetch traffic data for:', cleanUrl)
      await fetchTrafficData(cleanUrl)

      // clear previous competitor results when analyzing a new site
      setCompetitorResults(null)

    } catch (err: any) {
      setError(err.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  const fetchTrafficData = async (domain: string) => {
    setLoadingTraffic(true)
    try {
      const params = new URLSearchParams({
        domain,
        days: '14'
      })

      // Use userEmailState (from Supabase) or userEmail prop
      const emailToUse = userEmailState || userEmail
      if (emailToUse) {
        params.append('email', emailToUse)
      }

      console.log('🔍 Fetching traffic with email:', emailToUse)

      const response = await fetch(`http://localhost:3010/api/traffic/data?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Traffic data received:', data.source)
        setTrafficData(data)
      } else if (response.status === 404) {
        // No real data available
        const errorData = await response.json()
        console.log('⚠️ No real traffic data:', errorData.message)
        setTrafficData(null)
      } else {
        console.error('❌ Failed to fetch traffic data')
        setTrafficData(null)
      }
    } catch (err) {
      console.error('❌ Error fetching traffic:', err)
      setTrafficData(null)
    } finally {
      setLoadingTraffic(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'rgb(34, 197, 94)'
    if (score >= 50) return 'rgb(234, 179, 8)'
    return 'rgb(239, 68, 68)'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Needs Work'
    return 'Poor'
  }

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      google_analytics: { label: 'Real Data (GA)', variant: 'default' },
      search_console: { label: 'Real Data (Search Console)', variant: 'default' },
      similarweb_estimate: { label: 'Estimated (SimilarWeb)', variant: 'secondary' },
      estimated: { label: 'Estimated', variant: 'outline' }
    }
    return badges[source] || { label: 'Unknown', variant: 'outline' }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Load user email for competitor analysis
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user?.email) {
          console.log('✅ User email from Supabase:', data.user.email)
          setUserEmailState(data.user.email)
          
          // Check if user has GA connected by trying to fetch their properties
          try {
            const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(data.user.email)}`)
            if (response.ok) {
              const statusData = await response.json()
              console.log('📊 GA connection status:', statusData)
              setIsGAConnected(statusData.connected)
            }
          } catch (err) {
            console.log('⚠️ Could not check GA status:', err)
            setIsGAConnected(false)
          }
        } else {
          console.log('⚠️ No user email from Supabase')
          setIsGAConnected(false)
        }
      } catch (err) {
        console.error('❌ Error getting user from Supabase:', err)
        setIsGAConnected(false)
      }
    }
    init()
  }, [])

  // Auto-populate competitor field with a real competitor when website is analyzed
  useEffect(() => {
    if (healthScore && !competitorDomainInput) {
      // Suggest a competitor based on the domain
      const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (domain.includes('agenticforge')) {
        setCompetitorDomainInput('zapier.com'); // AI automation competitor
      } else if (domain.includes('ecommerce') || domain.includes('shop')) {
        setCompetitorDomainInput('shopify.com');
      } else {
        // Default competitor suggestion
        setCompetitorDomainInput('competitor.com');
      }
    }
  }, [healthScore, url, competitorDomainInput])

  const cleanDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/\/$/, '')

  const handleAnalyzeCompetitor = async () => {
    if (!competitorDomainInput || !url) return
    const yourSite = cleanDomain(url)
    const competitorSite = cleanDomain(competitorDomainInput)
    setLoadingCompetitor(true)
    setCompetitorResults(null)
    try {
      const body = {
        email: userEmailState || undefined,
        yourSite,
        competitorSite,
        forceRefresh: false
      }

      const res = await fetch('http://localhost:3010/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || 'Failed to analyze competitor')
      }

      const data = await res.json()
      setCompetitorResults(data)
    } catch (error) {
      console.error('Error analyzing competitor:', error)
      setCompetitorResults({ error: error instanceof Error ? error.message : 'Error' })
    } finally {
      setLoadingCompetitor(false)
    }
  }

  // Competitor data - replace with real data
  const competitorData = [
    { metric: 'Domain Authority', yourSite: healthScore?.breakdown?.technical_seo || 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
    { metric: 'Monthly Traffic', yourSite: healthScore?.breakdown?.performance || 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
    { metric: 'Social Followers', yourSite: healthScore?.breakdown?.seo || 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {getDisplayName()}!</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor your website performance and SEO metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!healthScore}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('website')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'website'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Website
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'seo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            SEO
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all border-2 ${
              activeTab === 'social'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'text-gray-600 border-gray-300 hover:border-orange-500'
            }`}
          >
            Social Metrics
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter website URL (e.g., example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                      disabled={analyzing}
                      className="pl-10 h-12 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <Button
                    onClick={analyzeWebsite}
                    disabled={analyzing || !url}
                    className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Score */}
            {healthScore ? (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left: Description */}
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Your overall SEO health score based on technical performance, on-page optimization, 
                        and content quality. This score reflects how well your site is optimized for search engines.
                      </p>
                      <Button
                        onClick={() => router.push('/dashboard/seo-performance')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        View Full Report
                      </Button>
                    </div>

                    {/* Right: Circular Score */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-44 h-44">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="88"
                            cy="88"
                            r="72"
                            stroke="#e5e7eb"
                            strokeWidth="14"
                            fill="none"
                          />
                          <circle
                            cx="88"
                            cy="88"
                            r="72"
                            stroke={getScoreBgColor(healthScore.overall_score)}
                            strokeWidth="14"
                            fill="none"
                            strokeDasharray={`${(healthScore.overall_score / 100) * 452.39} 452.39`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-bold ${getScoreColor(healthScore.overall_score)}`}>
                            {healthScore.overall_score}/100
                          </span>
                          <span className="text-xs text-gray-600 mt-1">{getScoreLabel(healthScore.overall_score)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analyze Your Website
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Enter your website URL above to get a comprehensive health score and SEO analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Website Traffic Chart */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold">Website Traffic</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">Last 14 days performance</p>
                  </div>
                  {trafficData && (
                    <Badge variant={getSourceBadge(trafficData.source).variant} className="text-xs">
                      {getSourceBadge(trafficData.source).label}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {loadingTraffic ? (
                  <div className="h-48 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : trafficData ? (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total Visitors</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(trafficData.summary.totalVisitors)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Daily Average</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(trafficData.summary.avgDailyVisitors)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                          Trend {getTrendIcon(trafficData.summary.trend)}
                        </p>
                        <p className={`text-xl font-bold ${
                          trafficData.summary.trend === 'up' ? 'text-green-600' : 
                          trafficData.summary.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {trafficData.summary.changePercent > 0 ? '+' : ''}
                          {trafficData.summary.changePercent}%
                        </p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-48 flex items-end justify-between gap-1">
                      {trafficData.data.map((point, index) => {
                        const maxVisitors = Math.max(...trafficData.data.map(d => d.visitors))
                        const height = (point.visitors / maxVisitors) * 100
                        
                        return (
                          <div 
                            key={index} 
                            className="flex-1 flex flex-col items-center justify-end h-full group relative"
                          >
                            <div 
                              className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-sm hover:from-orange-600 hover:to-orange-400 transition-all cursor-pointer"
                              style={{ height: `${height}%` }}
                            >
                              {/* Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none z-10">
                                <div className="font-semibold">{point.date}</div>
                                <div>{formatNumber(point.visitors)} visitors</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>Day 1</span>
                      <span>Day 7</span>
                      <span>Day 14</span>
                    </div>

                    {/* Data Source Info */}
                    {trafficData.source === 'estimated' && (
                      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          <strong>Estimated data:</strong> Connect Google Analytics for real traffic data. 
                          These estimates are based on website characteristics.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center max-w-md">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      {isGAConnected === true ? (
                        <>
                          <p className="text-sm font-semibold text-gray-700 mb-2">No Traffic Data for This Domain</p>
                          <p className="text-xs text-gray-600 mb-3">
                            Google Analytics is connected, but no data is available for this domain. 
                            Make sure the domain matches your GA property.
                          </p>
                        </>
                      ) : isGAConnected === false ? (
                        <>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Google Analytics Not Connected</p>
                          <p className="text-xs text-gray-600 mb-3">
                            Connect Google Analytics to see real traffic data for your websites.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            onClick={() => router.push('/dashboard/seo-performance')}
                          >
                            Connect Google Analytics
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Checking Analytics Connection...</p>
                          <Loader2 className="w-6 h-6 mx-auto animate-spin text-orange-500" />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competitor Benchmarking */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-lg font-bold">Competitor Benchmarking</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="competitor.com"
                      value={competitorDomainInput}
                      onChange={(e) => setCompetitorDomainInput(e.target.value)}
                      className="text-sm w-48"
                    />
                    <Button
                      onClick={handleAnalyzeCompetitor}
                      disabled={!competitorDomainInput || !url || loadingCompetitor}
                      className="h-9"
                    >
                      {loadingCompetitor ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing
                        </>
                      ) : (
                        'Analyze'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCompetitor ? (
                  <div className="h-32 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : competitorResults ? (
                  competitorResults.error ? (
                    <div className="p-4 text-sm text-red-600">{competitorResults.error}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Metric</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Your Site</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Competitor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Domain Authority */}
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">Domain Authority</td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.yourSite?.domainAuthority ?? healthScore?.breakdown?.technical_seo ?? '-'}
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.competitorSite?.domainAuthority ?? '-'}
                            </td>
                          </tr>

                          {/* Monthly Traffic */}
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">Monthly Traffic</td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.yourSite?.traffic?.monthly || trafficData?.summary?.totalVisitors || '-'}
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.competitorSite?.traffic?.monthly || competitorResults?.competitorSite?.traffic?.summary?.totalVisitors || '-'}
                            </td>
                          </tr>

                          {/* Social Followers */}
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">Social Followers</td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.yourSite?.social?.followers ?? '-'}
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700">
                              {competitorResults?.competitorSite?.social?.followers ?? '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="h-28 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-sm">Enter a competitor domain and analyze to compare metrics</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">
                    View Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Top 10 Quick Wins */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Top 10 Quick Wins</CardTitle>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  // Show loading state while analyzing
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Analyzing opportunities...</p>
                    </div>
                  </div>
                ) : lighthouseData?.opportunities && lighthouseData.opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {lighthouseData.opportunities.slice(0, 10).map((opp: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          index === 0 ? 'bg-orange-500' : 'bg-gray-200'
                        }`}>
                          {index === 0 ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {opp.title || `Optimization ${index + 1}`}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {opp.description?.substring(0, 80) || 'No description available'}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Analyze a website to see quick wins
                    </p>
                  </div>
                )}
                <div className="mt-4 text-right">
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    Last 7 days
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Cards removed - saved for later use:
                - GoogleAnalyticsCard (Connect Google Analytics & Search Console)
                - SocialMediaMetricsCard (Social Media Metrics)
            */}
          </div>
        </div>
      </div>
    </div>
  )
}