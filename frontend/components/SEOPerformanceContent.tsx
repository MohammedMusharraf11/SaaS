'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Loader2, 
  Globe, 
  AlertCircle, 
  TrendingUp, 
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  Eye,
  Code,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Lock
} from 'lucide-react'
import { generatePDFReport } from '@/utils/pdfGenerator'

interface SEOPerformanceContentProps {
  user: any
}

const loadingFacts = [
  "🚀 Running comprehensive website audit...",
  "🔍 Analyzing 100+ SEO factors...",
  "⚡ Testing page load performance...",
  "🎯 Checking mobile responsiveness...",
  "📊 Measuring Core Web Vitals...",
  "🔒 Validating security headers...",
]

export default function SEOPerformanceContent({ user }: SEOPerformanceContentProps) {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [lighthouseData, setLighthouseData] = useState<any>(null)
  const [error, setError] = useState('')
  const [currentFact, setCurrentFact] = useState(0)
  const [timePeriod, setTimePeriod] = useState('30')

  const analyzeWebsite = async () => {
    if (!url) return

    setAnalyzing(true)
    setError('')
    setAnalysisResult(null)
    setLighthouseData(null)
    setCurrentFact(0)

    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % loadingFacts.length)
    }, 3000)

    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

      const healthResponse = await fetch('http://localhost:3010/api/health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanUrl })
      })

      if (!healthResponse.ok) throw new Error('Failed to analyze website')

      const healthData = await healthResponse.json()
      setAnalysisResult(healthData)

      try {
        const lighthouseResponse = await fetch(`http://localhost:3010/api/lighthouse/${cleanUrl}`)
        if (lighthouseResponse.ok) {
          const lighthouseJson = await lighthouseResponse.json()
          setLighthouseData(lighthouseJson)
        }
      } catch (err) {
        console.warn('Lighthouse data not available')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze website')
    } finally {
      clearInterval(factInterval)
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
    if (score >= 50) return 'At risk'
    return 'Poor'
  }

  const handleDownloadReport = () => {
    if (analysisResult && lighthouseData) {
      generatePDFReport(analysisResult, lighthouseData, [])
    } else {
      alert('Please analyze a website first before downloading a report.')
    }
  }

  // Count actual errors, warnings, and notices from Lighthouse data
  const getIssuesCounts = () => {
    if (!lighthouseData) return { errors: 0, warnings: 0, notices: 0 }
    
    const errors = lighthouseData.seoAnalysis ? 
      Object.values(lighthouseData.seoAnalysis).filter(v => v === false).length : 0
    
    const warnings = lighthouseData.opportunities?.length || 0
    
    const notices = lighthouseData.bestPracticesBreakdown ? 
      Object.values(lighthouseData.bestPracticesBreakdown).filter((v: any) => v?.passed === true).length : 0
    
    return { errors, warnings, notices }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SEO & Website Performance
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Time Period Dropdown - Disabled for now */}
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            >
              <option value="30">Last 30 days</option>
            </select>
            {analysisResult && (
              <Button
                onClick={handleDownloadReport}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!analysisResult && (
          <Card className="mb-6 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter website URL to analyze (e.g., example.com)"
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

              {analyzing && (
                <div className="flex items-center gap-3 p-3 mt-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-700">{loadingFacts[currentFact]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && lighthouseData && (
          <div className="space-y-6">
            {/* Top Row - Site Audit, Page Speed, SEO Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Site Audit */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Site Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {/* Circular Progress */}
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
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
                          stroke={getScoreBgColor(analysisResult.overall_score)}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(analysisResult.overall_score / 100) * 351.86} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(analysisResult.overall_score)}`}>
                          {analysisResult.overall_score}%
                        </span>
                        <span className="text-xs text-gray-600">{getScoreLabel(analysisResult.overall_score)}</span>
                      </div>
                    </div>

                    {/* Real Stats from Lighthouse */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-600">Errors</span>
                        <span className="font-medium text-red-600">{getIssuesCounts().errors}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-600">Warnings</span>
                        <span className="font-medium text-orange-500">
                          {getIssuesCounts().warnings}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-600">Notices</span>
                        <span className="font-medium text-blue-600">{getIssuesCounts().notices}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Speed - Desktop */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    {/* Desktop Score */}
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
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
                          stroke={getScoreBgColor(lighthouseData.categoryScores.performance)}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(lighthouseData.categoryScores.performance / 100) * 351.86} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(lighthouseData.categoryScores.performance)}`}>
                          {Math.round(lighthouseData.categoryScores.performance)}%
                        </span>
                        <span className="text-xs text-gray-600">{getScoreLabel(lighthouseData.categoryScores.performance)}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Page Speed Performance</p>
                      <p className="text-xs text-gray-500 mt-1">Based on Lighthouse audit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Score */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    {/* SEO Score */}
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
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
                          stroke={getScoreBgColor(lighthouseData.categoryScores.seo)}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(lighthouseData.categoryScores.seo / 100) * 351.86} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(lighthouseData.categoryScores.seo)}`}>
                          {Math.round(lighthouseData.categoryScores.seo)}%
                        </span>
                        <span className="text-xs text-gray-600">{getScoreLabel(lighthouseData.categoryScores.seo)}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Search Optimization</p>
                      <p className="text-xs text-gray-500 mt-1">Technical SEO health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Accessibility */}
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Accessibility</p>
                      <p className={`text-3xl font-bold ${getScoreColor(lighthouseData.categoryScores.accessibility)}`}>
                        {Math.round(lighthouseData.categoryScores.accessibility)}%
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card className="border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Best Practices</p>
                      <p className={`text-3xl font-bold ${getScoreColor(lighthouseData.categoryScores['best-practices'])}`}>
                        {Math.round(lighthouseData.categoryScores['best-practices'])}%
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Technical SEO */}
              {analysisResult.breakdown?.seo_health && (
                <Card className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">SEO Health</p>
                        <p className={`text-3xl font-bold ${getScoreColor(analysisResult.breakdown.seo_health)}`}>
                          {Math.round(analysisResult.breakdown.seo_health)}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Experience */}
              {analysisResult.breakdown?.user_experience && (
                <Card className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">User Experience</p>
                        <p className={`text-3xl font-bold ${getScoreColor(analysisResult.breakdown.user_experience)}`}>
                          {Math.round(analysisResult.breakdown.user_experience)}%
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Core Web Vitals - Real Data */}
            {lighthouseData.coreWebVitals && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LCP */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Largest Contentful Paint (LCP)</p>
                      <p className={`text-3xl font-bold mb-1 ${
                        lighthouseData.coreWebVitals.lcp?.rating === 'good' ? 'text-green-600' :
                        lighthouseData.coreWebVitals.lcp?.rating === 'needs-improvement' ? 'text-orange-500' :
                        'text-red-600'
                      }`}>
                        {lighthouseData.coreWebVitals.lcp?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{lighthouseData.coreWebVitals.lcp?.rating || 'Unknown'}</p>
                    </div>

                    {/* FID */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">First Input Delay (FID)</p>
                      <p className={`text-3xl font-bold mb-1 ${
                        lighthouseData.coreWebVitals.fid?.rating === 'good' ? 'text-green-600' :
                        lighthouseData.coreWebVitals.fid?.rating === 'needs-improvement' ? 'text-orange-500' :
                        'text-red-600'
                      }`}>
                        {lighthouseData.coreWebVitals.fid?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{lighthouseData.coreWebVitals.fid?.rating || 'Unknown'}</p>
                    </div>

                    {/* CLS */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Cumulative Layout Shift (CLS)</p>
                      <p className={`text-3xl font-bold mb-1 ${
                        lighthouseData.coreWebVitals.cls?.rating === 'good' ? 'text-green-600' :
                        lighthouseData.coreWebVitals.cls?.rating === 'needs-improvement' ? 'text-orange-500' :
                        'text-red-600'
                      }`}>
                        {lighthouseData.coreWebVitals.cls?.displayValue || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{lighthouseData.coreWebVitals.cls?.rating || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunities - Real Data */}
            {lighthouseData.opportunities && lighthouseData.opportunities.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Optimization Opportunities</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Actionable improvements to boost your performance</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lighthouseData.opportunities.slice(0, 8).map((opp: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{opp.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{opp.description}</p>
                            {opp.savings && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  Potential savings: ~{(opp.savings / 1000).toFixed(2)}s
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Features - Locked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keyword Ranking - Premium */}
              <Card className="border-gray-200 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h3>
                    <p className="text-sm text-gray-600 mb-4">Keyword ranking tracking requires premium subscription</p>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-400">Keyword Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>Requires Google Search Console integration</p>
                  </div>
                </CardContent>
              </Card>

              {/* Backlink Overview - Premium */}
              <Card className="border-gray-200 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h3>
                    <p className="text-sm text-gray-600 mb-4">Backlink analysis requires premium API access</p>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-400">Backlink Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>Requires Ahrefs/Moz integration</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !analyzing && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Start Analyzing Your Website
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-4">
                Enter your website URL above to get comprehensive SEO insights with real performance data.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4">
                <div className="p-4">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Performance</p>
                </div>
                <div className="p-4">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Security</p>
                </div>
                <div className="p-4">
                  <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Accessibility</p>
                </div>
                <div className="p-4">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">SEO</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}