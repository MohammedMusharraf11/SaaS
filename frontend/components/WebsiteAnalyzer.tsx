'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface AnalysisResult {
  domain: string
  overall_score: number
  breakdown: {
    technical: number
    technical_seo: number
    user_experience?: number
    seo_health?: number
    search_visibility?: number
  }
  timestamp: string
  data_quality: {
    level: string
    sources: {
      lighthouse_available: boolean
      pagespeed_available: boolean
      analytics_available: boolean
      search_console_available: boolean
      technical_seo_available: boolean
    }
  }
}

export default function WebsiteAnalyzer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze website')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    if (score >= 60) return <TrendingUp className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Website Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter your website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={analyzeWebsite} 
              disabled={loading}
              className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Website'
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Get comprehensive SEO analysis, performance insights, and technical health score for your website.
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg text-gray-900">
                <span>Overall Health Score</span>
                <Badge className={`px-3 py-1 text-sm font-medium ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                {getScoreIcon(result.overall_score)}
                <span className="text-sm text-gray-600">
                  Analysis for <strong className="text-gray-900">{result.domain}</strong>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.overall_score >= 80 ? 'bg-green-500' :
                    result.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.overall_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Technical Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Technical Score</span>
                    <Badge className={`px-3 py-1 text-sm font-medium ${getScoreColor(result.breakdown.technical)}`}>
                      {result.breakdown.technical}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Technical SEO</span>
                    <Badge className={`px-3 py-1 text-sm font-medium ${getScoreColor(result.breakdown.technical_seo)}`}>
                      {result.breakdown.technical_seo}/100
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">PageSpeed Insights</span>
                    <Badge variant={result.data_quality.sources.pagespeed_available ? "default" : "secondary"} className="text-xs">
                      {result.data_quality.sources.pagespeed_available ? "Available" : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Technical SEO</span>
                    <Badge variant={result.data_quality.sources.technical_seo_available ? "default" : "secondary"} className="text-xs">
                      {result.data_quality.sources.technical_seo_available ? "Available" : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Data Quality</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {result.data_quality.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Info */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-500 text-center">
                Analysis completed at {new Date(result.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
