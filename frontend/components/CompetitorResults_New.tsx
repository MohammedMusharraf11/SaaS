'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  TrendingUp, Target, Globe, Activity, Share2, Sparkles, 
  Lightbulb, Loader2, AlertCircle, ArrowRight, Zap, Shield, 
  CheckCircle2, Search, Instagram as InstagramIcon, 
  Facebook as FacebookIcon, Trophy
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface CompetitorResultsProps {
  data: any
}

export default function CompetitorResults({ data }: CompetitorResultsProps) {
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [aiError, setAiError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)

  if (!data) {
    return null
  }

  const actualData = data.data || data
  
  if (!actualData.success && !actualData.yourSite) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Analysis Failed</CardTitle>
          <CardDescription className="text-red-600">
            {actualData.error || 'Unable to complete competitor analysis'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { yourSite, competitorSite, comparison } = actualData

  if (!yourSite || !competitorSite || !comparison) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Incomplete Data</CardTitle>
          <CardDescription className="text-yellow-600">
            Required comparison data is missing
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate what to show
  const showTrafficCard = !!(yourSite?.traffic || competitorSite?.traffic || comparison?.traffic)
  const showContentCard = !!(yourSite?.contentUpdates || competitorSite?.contentUpdates || comparison?.contentUpdates)
  const showGoogleAdsCard = !!(competitorSite?.googleAds && competitorSite.googleAds.totalAds > 0)
  const showMetaAdsCard = !!(competitorSite?.metaAds && competitorSite.metaAds.totalAds > 0)
  const showInstagramCard = !!(yourSite?.instagram || competitorSite?.instagram)
  const showFacebookCard = !!(yourSite?.facebook || competitorSite?.facebook)

  // API call to fetch AI recommendations
  const fetchAIRecommendations = async () => {
    setIsLoadingAI(true)
    setAiError(null)

    try {
      const response = await fetch('http://localhost:3010/api/competitor/ai-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourSite,
          competitorSite,
          comparison
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch recommendations')
      }

      if (result.success && result.recommendations) {
        setAiRecommendations(result.recommendations)
        setIsFallback(result.isFallback || false)
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error: any) {
      setAiError(error.message || 'Failed to generate AI recommendations')
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Chart data
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
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
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
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
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
        position: 'bottom' as const
      }
    }
  }

  const yourMarketShare = yourSite?.lighthouse?.categories?.seo?.score || 61
  const competitorMarketShare = competitorSite?.lighthouse?.categories?.seo?.score || 29

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Top Row: Traffic Chart and Content Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Website Traffic Chart */}
        {showTrafficCard && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Website Traffic (Referral)
                <sup className="text-xs text-muted-foreground">+1</sup>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-muted-foreground">Traffic Chart Coming Soon</p>
              </div>
              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Your Traffic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Competitor's Traffic</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Updates Chart */}
        {showContentCard && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Content Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={performanceChartData} options={{
                  ...barChartOptions,
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Second Row: Market Share and Paid Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Share (Visibility) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Market Share (Visibility)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              {/* Market share donut chart */}
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  {/* Your market share (green) */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#22c55e"
                    strokeWidth="24"
                    fill="none"
                    strokeDasharray={`${yourMarketShare * 5.02} 502`}
                  />
                  {/* Competitor market share (orange) */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#f97316"
                    strokeWidth="24"
                    fill="none"
                    strokeDasharray={`${competitorMarketShare * 5.02} 502`}
                    strokeDashoffset={`-${yourMarketShare * 5.02}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-green-600">
                    {yourMarketShare}%
                  </div>
                  <div className="text-sm text-muted-foreground">vs 1 competitor</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Your market share</span>
                <span className="font-semibold text-green-600">{yourMarketShare}% ↑</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Competitor's market share</span>
                <span className="font-semibold text-orange-600">{competitorMarketShare}%</span>
              </div>
            </div>
            <div className="mt-6">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                View Full Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Paid Ads Monitoring */}
        {(showGoogleAdsCard || showMetaAdsCard) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Paid Ads Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center text-xs text-muted-foreground font-medium border-b pb-2">
                  <div>Your Ads</div>
                  <div>Competitor A</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Visibility Index</span>
                    <div className="flex gap-12">
                      <span className="text-sm font-semibold">97%</span>
                      <span className="text-sm font-semibold">43%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm">Active Ads (detected)</span>
                    <div className="flex gap-12">
                      <span className="text-sm font-semibold">
                        {yourSite?.googleAds?.totalAds || yourSite?.metaAds?.totalAds || 25}
                      </span>
                      <span className="text-sm font-semibold">
                        {competitorSite?.googleAds?.totalAds || competitorSite?.metaAds?.totalAds || 19}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Spend signal</span>
                    <div className="flex gap-6 text-xs">
                      <span>High ($10-15k est.)</span>
                      <span>Medium ($7-10k)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  View Full Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Your Site Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              {yourSite?.domain || 'Your Site'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ScoreCircle 
                label="Performance" 
                score={yourSite?.lighthouse?.categories?.performance?.displayValue || 0} 
                icon={<Zap className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="Accessibility" 
                score={yourSite?.lighthouse?.categories?.accessibility?.displayValue || 0} 
                icon={<Shield className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="Best Practices" 
                score={yourSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0} 
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="SEO" 
                score={yourSite?.lighthouse?.categories?.seo?.displayValue || 0} 
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Competitor Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {competitorSite?.domain || 'Competitor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ScoreCircle 
                label="Performance" 
                score={competitorSite?.lighthouse?.categories?.performance?.displayValue || 0} 
                icon={<Zap className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="Accessibility" 
                score={competitorSite?.lighthouse?.categories?.accessibility?.displayValue || 0} 
                icon={<Shield className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="Best Practices" 
                score={competitorSite?.lighthouse?.categories?.['best-practices']?.displayValue || 0} 
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <ScoreCircle 
                label="SEO" 
                score={competitorSite?.lighthouse?.categories?.seo?.displayValue || 0} 
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media & Additional Insights */}
      {(showInstagramCard || showFacebookCard) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Social Media Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Social Media Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showInstagramCard && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4" />
                      Instagram
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Your Stats:</p>
                        {yourSite?.instagram ? (
                          <div className="space-y-1">
                            <p>Followers: {yourSite.instagram.followers?.toLocaleString() || 'N/A'}</p>
                            <p>Posts: {yourSite.instagram.posts || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not connected</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Competitor:</p>
                        {competitorSite?.instagram ? (
                          <div className="space-y-1">
                            <p>Followers: {competitorSite.instagram.followers?.toLocaleString() || 'N/A'}</p>
                            <p>Posts: {competitorSite.instagram.posts || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {showFacebookCard && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FacebookIcon className="h-4 w-4" />
                      Facebook
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Your Stats:</p>
                        {yourSite?.facebook ? (
                          <div className="space-y-1">
                            <p>Likes: {yourSite.facebook.likes?.toLocaleString() || 'N/A'}</p>
                            <p>Followers: {yourSite.facebook.followers?.toLocaleString() || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not connected</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Competitor:</p>
                        {competitorSite?.facebook ? (
                          <div className="space-y-1">
                            <p>Likes: {competitorSite.facebook.likes?.toLocaleString() || 'N/A'}</p>
                            <p>Followers: {competitorSite.facebook.followers?.toLocaleString() || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI-Powered Recommendations */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Recommendations
            </CardTitle>
            {!showAIRecommendations && (
              <Button 
                onClick={() => {
                  setShowAIRecommendations(true)
                  fetchAIRecommendations()
                }}
                disabled={isLoadingAI}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get AI Insights
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showAIRecommendations && (
          <CardContent>
            {isLoadingAI ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-sm text-muted-foreground">Analyzing competitor data...</p>
              </div>
            ) : aiError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-4">
                {isFallback && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Showing template recommendations. AI service temporarily unavailable.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRecommendations.map((rec, idx) => (
                    <AIRecommendationCard key={idx} {...rec} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Click "Get AI Insights" to receive personalized recommendations
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Score Circle Component
function ScoreCircle({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-green-50', text: 'text-green-600' }
    if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-600' }
    return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' }
  }

  const { stroke, bg, text } = getColor(score)
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`flex flex-col items-center p-4 ${bg} rounded-lg`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={stroke}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${text}`}>{score}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </div>
    </div>
  )
}

// AI Recommendation Card Component
function AIRecommendationCard({ title, impact, effort, description, steps }: {
  title: string
  impact: string
  effort: string
  description: string
  steps: string[]
}) {
  const getImpactColor = (impact: string) => {
    if (impact === 'High') return 'bg-red-100 text-red-700 border-red-200'
    if (impact === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getEffortColor = (effort: string) => {
    if (effort === 'High') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (effort === 'Medium') return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex gap-2">
          <Badge className={`text-xs ${getImpactColor(impact)}`}>
            {impact} Impact
          </Badge>
          <Badge className={`text-xs ${getEffortColor(effort)}`}>
            {effort} Effort
          </Badge>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-700">Steps:</p>
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-xs text-gray-500">{idx + 1}.</span>
            <span className="text-xs text-gray-600">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
