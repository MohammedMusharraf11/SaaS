'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Shield,
  Code,
  FileText,
  Image,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Target,
  Lightbulb
} from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface CompetitorResultsProps {
  data: any
}

export default function CompetitorResults({ data }: CompetitorResultsProps) {
  if (!data) {
    return null
  }

  // Handle both direct data and nested data structures
  const actualData = data.data || data
  
  if (!actualData.success && !actualData.yourSite) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <p>Analysis failed. Please try again with different URLs.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { yourSite, competitorSite, comparison } = actualData

  // Safety check for required data
  if (!yourSite || !competitorSite) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            <p>Incomplete data received. Some analysis results may be missing.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Needs Work'
    return 'Poor'
  }

  const getWinnerBadge = (winner: string) => {
    if (winner === 'yours') {
      return <Badge className="bg-green-600"><Crown className="w-3 h-3 mr-1" /> Winner</Badge>
    } else {
      return <Badge variant="secondary"><Trophy className="w-3 h-3 mr-1" /> Behind</Badge>
    }
  }

  // Create chart data for performance comparison
  const performanceChartData = {
    labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
    datasets: [
      {
        label: yourSite?.domain || 'Your Site',
        data: [
          yourSite?.lighthouse?.categories?.performance?.displayValue || 0,
          yourSite?.lighthouse?.categories?.accessibility?.displayValue || 0,
          yourSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0,
          yourSite?.lighthouse?.categories?.seo?.displayValue || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: competitorSite?.domain || 'Competitor',
        data: [
          competitorSite?.lighthouse?.categories?.performance?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.accessibility?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0,
          competitorSite?.lighthouse?.categories?.seo?.displayValue || 0
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Lighthouse Scores Comparison'
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Overall Winner */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Competition Results
              </CardTitle>
              <CardDescription className="mt-2">
                Comprehensive analysis completed for both websites
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-4 py-2">
              {comparison?.summary?.strengths?.length || 0} Strengths Found
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Site Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {yourSite.domain}
              </span>
              {comparison?.performance?.winner === 'yours' && getWinnerBadge('yours')}
            </CardTitle>
            <CardDescription>Your Website Performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lighthouse Scores */}
            <div className="grid grid-cols-2 gap-4">
              <ScoreCircle
                label="Performance"
                score={yourSite.lighthouse?.categories?.performance?.displayValue || 0}
                icon={<Zap className="h-4 w-4" />}
              />
              <ScoreCircle
                label="SEO"
                score={yourSite.lighthouse?.categories?.seo?.displayValue || 0}
                icon={<Target className="h-4 w-4" />}
              />
              <ScoreCircle
                label="Accessibility"
                score={yourSite.lighthouse?.categories?.accessibility?.displayValue || 0}
                icon={<Shield className="h-4 w-4" />}
              />
              <ScoreCircle
                label="Best Practices"
                score={yourSite.lighthouse?.categories?.['best-practices']?.displayValue || 0}
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
            </div>

            {/* PageSpeed Scores */}
            {yourSite.pagespeed?.dataAvailable && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">PageSpeed Scores</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Desktop</div>
                    <div className={`text-2xl font-bold ${getScoreColor(yourSite.pagespeed?.desktop?.performanceScore || 0)}`}>
                      {yourSite.pagespeed?.desktop?.performanceScore || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Mobile</div>
                    <div className={`text-2xl font-bold ${getScoreColor(yourSite.pagespeed?.mobile?.performanceScore || 0)}`}>
                      {yourSite.pagespeed?.mobile?.performanceScore || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitor Site Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-600" />
                {competitorSite.domain}
              </span>
              {comparison?.performance?.winner === 'competitor' && getWinnerBadge('competitor')}
            </CardTitle>
            <CardDescription>Competitor Website Performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lighthouse Scores */}
            <div className="grid grid-cols-2 gap-4">
              <ScoreCircle
                label="Performance"
                score={competitorSite.lighthouse?.categories?.performance?.displayValue || 0}
                icon={<Zap className="h-4 w-4" />}
              />
              <ScoreCircle
                label="SEO"
                score={competitorSite.lighthouse?.categories?.seo?.displayValue || 0}
                icon={<Target className="h-4 w-4" />}
              />
              <ScoreCircle
                label="Accessibility"
                score={competitorSite.lighthouse?.categories?.accessibility?.displayValue || 0}
                icon={<Shield className="h-4 w-4" />}
              />
              <ScoreCircle
                label="Best Practices"
                score={competitorSite.lighthouse?.categories?.['best-practices']?.displayValue || 0}
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
            </div>

            {/* PageSpeed Scores */}
            {competitorSite.pagespeed?.dataAvailable && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">PageSpeed Scores</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Desktop</div>
                    <div className={`text-2xl font-bold ${getScoreColor(competitorSite.pagespeed?.desktop?.performanceScore || 0)}`}>
                      {competitorSite.pagespeed?.desktop?.performanceScore || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Mobile</div>
                    <div className={`text-2xl font-bold ${getScoreColor(competitorSite.pagespeed?.mobile?.performanceScore || 0)}`}>
                      {competitorSite.pagespeed?.mobile?.performanceScore || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={performanceChartData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* SEO Comparison */}
      {comparison?.seo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SEO Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Site SEO */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {yourSite.domain}
                  {comparison.seo.winner === 'yours' && (
                    <Badge className="bg-green-600">Winner</Badge>
                  )}
                </h3>
                <SEOMetrics data={comparison.seo.metaTags.your} headings={comparison.seo.headings.your} />
              </div>

              {/* Competitor SEO */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {competitorSite.domain}
                  {comparison.seo.winner === 'competitor' && (
                    <Badge className="bg-green-600">Winner</Badge>
                  )}
                </h3>
                <SEOMetrics data={comparison.seo.metaTags.competitor} headings={comparison.seo.headings.competitor} />
              </div>
            </div>

            {/* SEO Score Comparison */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Your SEO Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(comparison.seo.scores.your)}`}>
                    {comparison.seo.scores.your}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Competitor SEO Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(comparison.seo.scores.competitor)}`}>
                    {comparison.seo.scores.competitor}/100
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Comparison */}
      {comparison?.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContentMetrics 
                title={yourSite.domain}
                data={comparison.content.your}
                isWinner={comparison.content.winner === 'yours'}
              />
              <ContentMetrics 
                title={competitorSite.domain}
                data={comparison.content.competitor}
                isWinner={comparison.content.winner === 'competitor'}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Stack */}
      {comparison?.technology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TechnologyStack title={yourSite.domain} data={comparison.technology.your} />
              <TechnologyStack title={competitorSite.domain} data={comparison.technology.competitor} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security & Technical */}
      {comparison?.security && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Technical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SecurityMetrics title={yourSite.domain} data={comparison.security.your} />
              <SecurityMetrics title={competitorSite.domain} data={comparison.security.competitor} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary & Recommendations */}
      {comparison?.summary && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strengths */}
            {comparison.summary.strengths?.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-green-700 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {comparison.summary.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {comparison.summary.weaknesses?.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-red-700 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {comparison.summary.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {comparison.summary.opportunities?.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-blue-700 mb-3">
                  <Target className="h-4 w-4" />
                  Opportunities
                </h3>
                <ul className="space-y-2">
                  {comparison.summary.opportunities.map((opportunity: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {comparison.summary.recommendations?.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 text-purple-700 mb-3">
                  <Lightbulb className="h-4 w-4" />
                  Action Items
                </h3>
                <ul className="space-y-2">
                  {comparison.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper Components

function ScoreCircle({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-green-50' }
    if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-yellow-50' }
    return { stroke: '#ef4444', bg: 'bg-red-50' }
  }

  const { stroke, bg } = getColor(score)
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`flex flex-col items-center p-4 ${bg} rounded-lg`}>
      <div className="relative w-20 h-20">
        <svg className="transform -rotate-90" width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </div>
    </div>
  )
}

function SEOMetrics({ data, headings }: { data: any; headings: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">Title Tag</span>
        {data.hasTitle ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">Meta Description</span>
        {data.hasDescription ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">H1 Tags</span>
        <Badge variant="outline">{headings.h1Count}</Badge>
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">H2 Tags</span>
        <Badge variant="outline">{headings.h2Count}</Badge>
      </div>
    </div>
  )
}

function ContentMetrics({ title, data, isWinner }: { title: string; data: any; isWinner: boolean }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        {title}
        {isWinner && <Badge className="bg-green-600">More Content</Badge>}
      </h3>
      <div className="space-y-2">
        <MetricRow icon={<FileText />} label="Word Count" value={data.wordCount?.toLocaleString()} />
        <MetricRow icon={<Image />} label="Images" value={data.imageCount} />
        <MetricRow icon={<Image />} label="Alt Text Coverage" value={`${data.imageAltCoverage}%`} />
        <MetricRow icon={<LinkIcon />} label="Total Links" value={data.totalLinks} />
        <MetricRow icon={<LinkIcon />} label="Internal Links" value={data.internalLinks} />
        <MetricRow icon={<LinkIcon />} label="External Links" value={data.externalLinks} />
      </div>
    </div>
  )
}

function TechnologyStack({ title, data }: { title: string; data: any }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">CMS</div>
          <div className="font-semibold">{data.cms || 'Unknown'}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">Frameworks</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.frameworks?.length > 0 ? (
              data.frameworks.map((fw: string, i: number) => (
                <Badge key={i} variant="outline">{fw}</Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">None detected</span>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">Analytics</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.analytics?.length > 0 ? (
              data.analytics.map((tool: string, i: number) => (
                <Badge key={i} variant="outline">{tool}</Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">None detected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityMetrics({ title, data }: { title: string; data: any }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-2">
        <MetricRow 
          icon={data.isHTTPS ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />} 
          label="HTTPS" 
          value={data.isHTTPS ? 'Enabled' : 'Disabled'} 
        />
        <MetricRow 
          icon={data.hasCDN ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-gray-400" />} 
          label="CDN" 
          value={data.cdnProvider || 'Not detected'} 
        />
        <MetricRow 
          icon={data.hasRobotsTxt ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />} 
          label="robots.txt" 
          value={data.hasRobotsTxt ? 'Found' : 'Missing'} 
        />
        <MetricRow 
          icon={data.hasSitemap ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />} 
          label="Sitemap" 
          value={data.hasSitemap ? `${data.sitemapUrls} URLs` : 'Missing'} 
        />
      </div>
    </div>
  )
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm flex items-center gap-2">
        {icon && <span className="h-4 w-4">{icon}</span>}
        {label}
      </span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  )
}
