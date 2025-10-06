'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart3, TrendingUp, Users, Globe, ArrowRight, Search, Loader2, AlertCircle } from 'lucide-react'
import GoogleAnalyticsCard from './GoogleAnalyticsCard'
import { useRouter } from 'next/navigation'

interface DashboardContentProps {
  userEmail?: string
  userName?: string
}

export default function DashboardContent({ userEmail, userName }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'website' | 'seo' | 'social'>('website')
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState<any>(null)
  const [error, setError] = useState('')

  // Extract first name from email or use full name
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

    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

      const healthResponse = await fetch('http://localhost:3010/api/health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanUrl })
      })

      if (!healthResponse.ok) throw new Error('Failed to analyze website')

      const healthData = await healthResponse.json()
      setHealthScore(healthData)

    } catch (err: any) {
      setError(err.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Needs improvement'
    return 'Poor'
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {getDisplayName()}!</h2>
          <p className="text-gray-600 mt-2">Monitor your marketing performance and get insights</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('website')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'website'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Website
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'seo'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SEO
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-2 rounded-full font-medium transition-colors border-2 ${
              activeTab === 'social'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'text-gray-600 border-gray-300 hover:border-orange-500'
            }`}
          >
            Social Metrics
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Health Score */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <Card className="border-gray-200">
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
                      className="pl-10 h-12 border-gray-300"
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

            {/* Health Score Card */}
            {healthScore ? (
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Left side - Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Score</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Your website's overall health score is calculated based on performance, 
                        SEO optimization, accessibility, and technical best practices. 
                        {healthScore.overall_score >= 80 && ' Your site is performing well!'}
                        {healthScore.overall_score >= 50 && healthScore.overall_score < 80 && ' There are some areas that need improvement.'}
                        {healthScore.overall_score < 50 && ' Your site needs significant optimization.'}
                      </p>
                      <Button
                        onClick={() => router.push('/dashboard/seo-performance')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        View Detailed Analysis
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Right side - Circular Progress */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
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

                  {/* Score Breakdown */}
                  {healthScore.breakdown && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(healthScore.breakdown).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                              {value}/100
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Quick Health Check
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Enter your website URL above to get a quick health score overview
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Google Analytics Card */}
            <GoogleAnalyticsCard userEmail={userEmail} />
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Tips - Moved to Top */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-700">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Quick Health Check</h4>
                      <p className="text-xs text-gray-600">Use the search bar to get instant health score of any website.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Deep Dive Analysis</h4>
                      <p className="text-xs text-gray-600">Click "SEO & Website Performance" for comprehensive insights.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-700">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Track Progress</h4>
                      <p className="text-xs text-gray-600">Monitor your scores regularly to track improvements.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Visitors</p>
                    <p className="text-lg font-bold text-gray-900">--</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">SEO Score</p>
                    <p className="text-lg font-bold text-gray-900">
                      {healthScore ? `${healthScore.overall_score}/100` : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Page Views</p>
                    <p className="text-lg font-bold text-gray-900">--</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard/seo-performance')}
                  className="w-full justify-start bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Full SEO Analysis
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-500"
                  disabled
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Social Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-500"
                  disabled
                >
                  <Users className="w-4 h-4 mr-2" />
                  Competitor Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}