'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
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
  Lightbulb,
  Sparkles,
  Loader2
} from 'lucide-react'

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
  // DEBUG: Log full competitorSite object to verify ads data
  console.log('COMPETITOR_SITE FULL DATA:', competitorSite);

  // DEBUG: Log what data we have
  console.log('🔍 CompetitorResults Debug:')
  console.log('   yourSite.traffic:', yourSite?.traffic ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.traffic:', competitorSite?.traffic ? 'EXISTS' : 'MISSING')
  console.log('   yourSite.contentChanges:', yourSite?.contentChanges ? 'EXISTS' : 'MISSING')
  console.log('   yourSite.contentChanges.success:', yourSite?.contentChanges?.success)
  console.log('   yourSite.contentChanges.monitoring:', yourSite?.contentChanges?.monitoring)
  console.log('   competitorSite.contentChanges:', competitorSite?.contentChanges ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.contentChanges.success:', competitorSite?.contentChanges?.success)
  console.log('   competitorSite.contentChanges.monitoring:', competitorSite?.contentChanges?.monitoring)
  console.log('   yourSite.contentUpdates:', yourSite?.contentUpdates ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.contentUpdates:', competitorSite?.contentUpdates ? 'EXISTS' : 'MISSING')
  console.log('   comparison.traffic:', comparison?.traffic ? 'EXISTS' : 'MISSING')
  console.log('   comparison.contentChanges:', comparison?.contentChanges ? 'EXISTS' : 'MISSING')
  console.log('   comparison.contentUpdates:', comparison?.contentUpdates ? 'EXISTS' : 'MISSING')
  console.log('   yourSite.instagram:', yourSite?.instagram ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.instagram:', competitorSite?.instagram ? 'EXISTS' : 'MISSING')
  console.log('   comparison.instagram:', comparison?.instagram ? 'EXISTS' : 'MISSING')
  console.log('   yourSite.facebook:', yourSite?.facebook ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.facebook:', competitorSite?.facebook ? 'EXISTS' : 'MISSING')
  console.log('   comparison.facebook:', comparison?.facebook ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.googleAds:', competitorSite?.googleAds ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.metaAds:', competitorSite?.metaAds ? 'EXISTS' : 'MISSING')
  console.log('   yourSite.puppeteer:', yourSite?.puppeteer ? 'EXISTS' : 'MISSING')
  console.log('   competitorSite.puppeteer:', competitorSite?.puppeteer ? 'EXISTS' : 'MISSING')
  
  // Puppeteer structure debug for Technology Stack
  if (yourSite?.puppeteer) {
    console.log('🔧 YOUR PUPPETEER STRUCTURE:', JSON.stringify(yourSite.puppeteer, null, 2))
  }
  if (competitorSite?.puppeteer) {
    console.log('🔧 COMPETITOR PUPPETEER STRUCTURE:', JSON.stringify(competitorSite.puppeteer, null, 2))
  }
  
  // Check the actual condition for showing cards
  const showTrafficCard = !!(yourSite?.traffic || competitorSite?.traffic || comparison?.traffic)
  const showContentChangesCard = !!(yourSite?.contentChanges?.success || competitorSite?.contentChanges?.success || comparison?.contentChanges)
  const showContentCard = !!(yourSite?.contentUpdates || competitorSite?.contentUpdates || comparison?.contentUpdates)
  const showInstagramCard = !!(yourSite?.instagram || competitorSite?.instagram || comparison?.instagram)
  const showFacebookCard = !!(yourSite?.facebook || competitorSite?.facebook || comparison?.facebook)
  const showGoogleAdsCard = !!(competitorSite?.googleAds && competitorSite.googleAds.totalAds > 0)
  const showMetaAdsCard = !!(competitorSite?.metaAds && competitorSite.metaAds.totalAds > 0)
  console.log('   showTrafficCard:', showTrafficCard)
  console.log('   showContentChangesCard:', showContentChangesCard)
  console.log('   showContentCard:', showContentCard)
  console.log('   showInstagramCard:', showInstagramCard)
  console.log('   showFacebookCard:', showFacebookCard)
  console.log('   showGoogleAdsCard:', showGoogleAdsCard)
  console.log('   showMetaAdsCard:', showMetaAdsCard)
  
  // Social Media Data Debug
  console.log('🔍 SOCIAL MEDIA DEBUG:')
  console.log('  yourSite.instagram:', yourSite?.instagram ? JSON.stringify(yourSite.instagram, null, 2) : 'NO DATA')
  console.log('  competitorSite.instagram:', competitorSite?.instagram ? JSON.stringify(competitorSite.instagram, null, 2) : 'NO DATA')
  console.log('  yourSite.facebook:', yourSite?.facebook ? JSON.stringify(yourSite.facebook, null, 2) : 'NO DATA')
  console.log('  competitorSite.facebook:', competitorSite?.facebook ? JSON.stringify(competitorSite.facebook, null, 2) : 'NO DATA')
  console.log('  comparison.instagram:', comparison?.instagram ? 'EXISTS' : 'MISSING')
  console.log('  comparison.facebook:', comparison?.facebook ? 'EXISTS' : 'MISSING')

  // Safety check for required data - but be more lenient
  if (!yourSite || !competitorSite || !comparison) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            <p>Incomplete data received. Some analysis results may be missing.</p>
            {yourSite && <p className="text-sm mt-2">Your site: {yourSite.domain || 'Unknown'}</p>}
            {competitorSite && <p className="text-sm">Competitor: {competitorSite.domain || 'Unknown'}</p>}
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

  // API call to fetch AI recommendations
  const fetchAIRecommendations = async () => {
    setIsLoadingAI(true)
    setAiError(null)

    try {
      console.log('🤖 Fetching AI recommendations...')
      console.log('Request data:', { yourSite: yourSite?.domain, competitorSite: competitorSite?.domain })
      
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

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate AI recommendations')
      }

      if (result.success && result.recommendations) {
        console.log('✅ Received recommendations:', result.recommendations.length)
        setAiRecommendations(result.recommendations)
        setIsFallback(result.isFallback || false)
        setShowAIRecommendations(true)
        
        // Show info if fallback recommendations
        if (result.isFallback) {
          console.log('ℹ️ Using fallback recommendations:', result.message)
        }
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error: any) {
      console.error('❌ Error fetching AI recommendations:', error)
      setAiError(error.message || 'Failed to generate AI recommendations. Please try again.')
    } finally {
      setIsLoadingAI(false)
    }
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
    <div className="w-full space-y-4 lg:space-y-6 animate-in fade-in duration-500">
      
      {/* Header with Overall Winner */}
      <Card className="border-2 border-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Competition Results
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Comprehensive analysis completed for both websites
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1">
              {comparison?.summary?.strengths?.length || 0} Strengths Found
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Facebook Engagement Card - Moved to social media section later */}
      {false && showFacebookCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📘 Facebook Page Engagement
            </CardTitle>
            <CardDescription>
              Facebook page metrics and audience engagement analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Facebook */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {comparison?.facebook?.your?.pageName || yourSite?.facebook?.profile?.name || 'N/A'}
                  {comparison?.facebook?.winner?.engagement === 'yours' && (
                    <Badge className="bg-green-600">Higher Engagement</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium">Followers</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                      {(comparison?.facebook?.your?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <div className="text-xs text-indigo-700 font-medium">Page Likes</div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1">
                      {(comparison?.facebook?.your?.likes || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-xs text-purple-700 font-medium">Talking About</div>
                    <div className="text-xl font-bold text-purple-900 mt-1">
                      {(comparison?.facebook?.your?.talkingAbout || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-xs text-green-700 font-medium">Engagement Rate</div>
                    <div className="text-xl font-bold text-green-900 mt-1">
                      {comparison?.facebook?.your?.engagementRate || '0%'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-xs">{comparison?.facebook?.your?.category || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">
                      {comparison?.facebook?.your?.rating?.toFixed(1) || '0'} ⭐ 
                      ({comparison?.facebook?.your?.ratingPercent || 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{(comparison?.facebook?.your?.ratingCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Activity Level</span>
                    <Badge variant={comparison?.facebook?.your?.activityLevel === 'High' ? 'default' : 'secondary'}>
                      {comparison?.facebook?.your?.activityLevel || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Est. Posts/Week</span>
                    <span className="font-semibold">{comparison?.facebook?.your?.estimatedPostsPerWeek || 0}</span>
                  </div>
                </div>
              </div>
              {/* Competitor Facebook */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {comparison?.facebook?.competitor?.pageName || competitorSite?.facebook?.profile?.name || 'N/A'}
                  {comparison?.facebook?.winner?.engagement === 'competitor' && (
                    <Badge className="bg-green-600">Higher Engagement</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="text-xs text-red-700 font-medium">Followers</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                      {(comparison?.facebook?.competitor?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-xs text-orange-700 font-medium">Page Likes</div>
                    <div className="text-2xl font-bold text-orange-900 mt-1">
                      {(comparison?.facebook?.competitor?.likes || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                    <div className="text-xs text-pink-700 font-medium">Talking About</div>
                    <div className="text-xl font-bold text-pink-900 mt-1">
                      {(comparison?.facebook?.competitor?.talkingAbout || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                    <div className="text-xs text-teal-700 font-medium">Engagement Rate</div>
                    <div className="text-xl font-bold text-teal-900 mt-1">
                      {comparison?.facebook?.competitor?.engagementRate || '0%'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-xs">{comparison?.facebook?.competitor?.category || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">
                      {comparison?.facebook?.competitor?.rating?.toFixed(1) || '0'} ⭐ 
                      ({comparison?.facebook?.competitor?.ratingPercent || 0}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{(comparison?.facebook?.competitor?.ratingCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Activity Level</span>
                    <Badge variant={comparison?.facebook?.competitor?.activityLevel === 'High' ? 'default' : 'secondary'}>
                      {comparison?.facebook?.competitor?.activityLevel || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Est. Posts/Week</span>
                    <span className="font-semibold">{comparison?.facebook?.competitor?.estimatedPostsPerWeek || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Google Ads Monitoring Card - Side by Side Comparison */}
      {(yourSite?.googleAds || competitorSite?.googleAds) && (
        <Card className="border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Paid Ads Monitoring (Google Ads)
            </CardTitle>
            <CardDescription>Compare Google Ads campaigns for both sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Site Google Ads */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Your Site: {yourSite.domain}
                </h3>
                {yourSite?.googleAds && !yourSite.googleAds.error && yourSite.googleAds.totalAds > 0 ? (
                  <>
                    <div className="mb-3">
                      <div><span className="font-semibold">Advertiser:</span> {yourSite.googleAds.advertiser || yourSite.domain}</div>
                      <div><span className="font-semibold">Total Ads (last 30 days):</span> {yourSite.googleAds.totalAds}</div>
                      {yourSite.googleAds.transparencyUrl && (
                        <a href={yourSite.googleAds.transparencyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">View Transparency Center</a>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">Sample Ads:</div>
                      {(yourSite.googleAds.adSamples || []).slice(0, 2).map((ad: any, idx: number) => (
                        <div key={ad.id || idx} className="border rounded p-2 bg-white text-sm">
                          <div><span className="font-semibold">Format:</span> {ad.format}</div>
                          <div><span className="font-semibold">Shown:</span> {ad.totalDaysShown} days</div>
                          {ad.detailsLink && (
                            <a href={ad.detailsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Details</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">No Google Ads data available</div>
                )}
              </div>

              {/* Competitor Google Ads */}
              <div className="border rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Competitor: {competitorSite.domain}
                </h3>
                {competitorSite?.googleAds && !competitorSite.googleAds.error && competitorSite.googleAds.totalAds > 0 ? (
                  <>
                    <div className="mb-3">
                      <div><span className="font-semibold">Advertiser:</span> {competitorSite.googleAds.advertiser || competitorSite.domain}</div>
                      <div><span className="font-semibold">Total Ads (last 30 days):</span> {competitorSite.googleAds.totalAds}</div>
                      {competitorSite.googleAds.transparencyUrl && (
                        <a href={competitorSite.googleAds.transparencyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">View Transparency Center</a>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">Sample Ads:</div>
                      {(competitorSite.googleAds.adSamples || []).slice(0, 2).map((ad: any, idx: number) => (
                        <div key={ad.id || idx} className="border rounded p-2 bg-white text-sm">
                          <div><span className="font-semibold">Format:</span> {ad.format}</div>
                          <div><span className="font-semibold">Shown:</span> {ad.totalDaysShown} days</div>
                          {ad.detailsLink && (
                            <a href={ad.detailsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Details</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">No Google Ads data available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta Ads Monitoring Card - Side by Side Comparison */}
      {(yourSite?.metaAds || competitorSite?.metaAds) && (
        <Card className="border-2 border-blue-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Paid Ads Monitoring (Meta/Facebook)
            </CardTitle>
            <CardDescription>Compare Meta/Facebook ad campaigns for both sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Site Meta Ads */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Your Site: {yourSite.domain}
                </h3>
                {yourSite?.metaAds && !yourSite.metaAds.error && yourSite.metaAds.totalAds > 0 ? (
                  <>
                    <div className="mb-3">
                      <div><span className="font-semibold">Total Ads:</span> {yourSite.metaAds.totalAds}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">Sample Ads:</div>
                      {(yourSite.metaAds.adSamples || []).slice(0, 2).map((ad: any, idx: number) => (
                        <div key={ad.id || idx} className="border rounded p-2 bg-white text-sm">
                          <div><span className="font-semibold">Page:</span> {ad.pageName}</div>
                          <div><span className="font-semibold">Active:</span> {ad.isActive ? 'Yes' : 'No'}</div>
                          <div className="text-xs text-gray-600">{ad.text?.slice(0, 80) || 'N/A'}{ad.text && ad.text.length > 80 ? '...' : ''}</div>
                          {ad.pageProfile && (
                            <a href={ad.pageProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Profile</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">No Meta Ads data available</div>
                )}
              </div>

              {/* Competitor Meta Ads */}
              <div className="border rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Competitor: {competitorSite.domain}
                </h3>
                {competitorSite?.metaAds && !competitorSite.metaAds.error && competitorSite.metaAds.totalAds > 0 ? (
                  <>
                    <div className="mb-3">
                      <div><span className="font-semibold">Total Ads:</span> {competitorSite.metaAds.totalAds}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">Sample Ads:</div>
                      {(competitorSite.metaAds.adSamples || []).slice(0, 2).map((ad: any, idx: number) => (
                        <div key={ad.id || idx} className="border rounded p-2 bg-white text-sm">
                          <div><span className="font-semibold">Page:</span> {ad.pageName}</div>
                          <div><span className="font-semibold">Active:</span> {ad.isActive ? 'Yes' : 'No'}</div>
                          <div className="text-xs text-gray-600">{ad.text?.slice(0, 80) || 'N/A'}{ad.text && ad.text.length > 80 ? '...' : ''}</div>
                          {ad.pageProfile && (
                            <a href={ad.pageProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Profile</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">No Meta Ads data available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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
            {yourSite.pagespeed && (yourSite.pagespeed.dataAvailable || yourSite.pagespeed.desktop || yourSite.pagespeed.mobile) && (
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
            {competitorSite.pagespeed && (competitorSite.pagespeed.dataAvailable || competitorSite.pagespeed.desktop || competitorSite.pagespeed.mobile) && (
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Metrics Comparison</CardTitle>
          <CardDescription className="text-sm">Side-by-side comparison of key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-64">
            <Bar data={performanceChartData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout for Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
      {/* SEO Comparison */}
      {comparison?.seo && comparison?.seo?.metaTags && comparison?.seo?.headings && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
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
                <SEOMetrics data={comparison.seo.metaTags?.your || {}} headings={comparison.seo.headings?.your || {}} />
              </div>

              {/* Competitor SEO */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {competitorSite.domain}
                  {comparison.seo.winner === 'competitor' && (
                    <Badge className="bg-green-600">Winner</Badge>
                  )}
                </h3>
                <SEOMetrics data={comparison.seo.metaTags?.competitor || {}} headings={comparison.seo.headings?.competitor || {}} />
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

      {/* Backlinks Comparison */}
      {(yourSite.backlinks || competitorSite.backlinks || comparison?.backlinks) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Backlinks Comparison
              {comparison?.backlinks?.winner === 'yours' && (
                <Badge className="bg-green-600 ml-2 text-xs">Leading</Badge>
              )}
              {comparison?.backlinks?.winner === 'competitor' && (
                <Badge className="bg-red-600 ml-2 text-xs">Behind</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Backlink profile analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Site Backlinks */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                  <Globe className="h-4 w-4" />
                  {yourSite.domain}
                  {yourSite.fromCache && (
                    <Badge variant="outline" className="text-xs">Cached</Badge>
                  )}
                </h3>
                {(() => {
                  // Debug: Log the backlinks structure
                  console.log('Your Site Backlinks Data:', yourSite.backlinks);
                  
                  const hasBacklinks = yourSite.backlinks && (
                    yourSite.backlinks.available === true || 
                    yourSite.backlinks.totalBacklinks > 0 ||
                    yourSite.backlinks.total_backlinks > 0
                  );

                  if (!hasBacklinks) {
                    return (
                      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                        No backlinks data available
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Total Backlinks</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {(yourSite.backlinks.totalBacklinks || yourSite.backlinks.total_backlinks || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">Referring Domains</div>
                          <div className="text-xl font-semibold">
                            {(yourSite.backlinks.totalRefDomains || yourSite.backlinks.referring_domains || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">Referring IPs</div>
                          <div className="text-xl font-semibold">
                            {(yourSite.backlinks.metrics?.ips || yourSite.backlinks.referring_ips || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">Referring Subnets</div>
                          <div className="text-xl font-semibold">
                            {(yourSite.backlinks.metrics?.subnets || yourSite.backlinks.referring_subnets || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">DoFollow Links</div>
                          <div className="text-xl font-semibold">
                            {(yourSite.backlinks.metrics?.dofollowBacklinks || yourSite.backlinks.dofollow || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Competitor Backlinks */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-red-600">
                  <Globe className="h-4 w-4" />
                  {competitorSite.domain}
                  {competitorSite.fromCache === false && (
                    <Badge variant="outline" className="text-xs">Fresh Data</Badge>
                  )}
                </h3>
                {competitorSite.backlinks ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm text-gray-600 mb-1">Total Backlinks</div>
                      <div className="text-3xl font-bold text-red-600">
                        {(competitorSite.backlinks.totalBacklinks || competitorSite.backlinks.total_backlinks || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">Referring Domains</div>
                        <div className="text-xl font-semibold">
                          {(competitorSite.backlinks.totalRefDomains || competitorSite.backlinks.referring_domains || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">Referring IPs</div>
                        <div className="text-xl font-semibold">
                          {(competitorSite.backlinks.metrics?.ips || competitorSite.backlinks.referring_ips || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">Referring Subnets</div>
                        <div className="text-xl font-semibold">
                          {(competitorSite.backlinks.metrics?.subnets || competitorSite.backlinks.referring_subnets || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">DoFollow Links</div>
                        <div className="text-xl font-semibold">
                          {(competitorSite.backlinks.metrics?.dofollowBacklinks || competitorSite.backlinks.dofollow || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                    No backlinks data available
                  </div>
                )}
              </div>
            </div>

            {/* Backlinks Difference */}
            {comparison?.backlinks && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Backlinks Difference</div>
                    <div className={`text-2xl font-bold ${comparison.backlinks.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {comparison.backlinks.difference > 0 ? '+' : ''}{comparison.backlinks.difference?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Your Total</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {comparison.backlinks.yours?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Competitor Total</div>
                    <div className="text-2xl font-bold text-red-600">
                      {comparison.backlinks.competitor?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      {/* Traffic Trends Comparison */}
      {(yourSite?.traffic || competitorSite?.traffic || comparison?.traffic) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Website Traffic Trends
            </CardTitle>
            <CardDescription className="text-sm">
              Monthly traffic comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show message if no data available */}
            {!comparison?.traffic && !yourSite?.traffic && !competitorSite?.traffic ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-600">Traffic data not available for comparison</p>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Site Traffic */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    {yourSite.domain}
                    {comparison?.traffic?.winner === 'yours' && (
                      <Badge className="bg-green-600">Higher Traffic</Badge>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-xs text-blue-700 font-medium">Monthly Visits</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">
                        {typeof (comparison?.traffic?.your?.monthlyVisits || yourSite?.traffic?.metrics?.monthlyVisits) === 'number' 
                          ? (comparison?.traffic?.your?.monthlyVisits || yourSite?.traffic?.metrics?.monthlyVisits).toLocaleString()
                          : (comparison?.traffic?.your?.monthlyVisits || yourSite?.traffic?.metrics?.monthlyVisits || 'N/A')}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Source: {(comparison?.traffic?.your?.source || yourSite?.traffic?.source) === 'google_analytics' ? 'Google Analytics' : 
                                 (comparison?.traffic?.your?.source || yourSite?.traffic?.source) === 'similarweb_rapidapi' ? 'SimilarWeb' : 
                                 (comparison?.traffic?.your?.source || yourSite?.traffic?.source || 'Unknown')}
                      </div>
                    </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Bounce Rate</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.your?.bounceRate === 'number' 
                        ? `${comparison.traffic.your.bounceRate.toFixed(1)}%`
                        : (comparison?.traffic?.your?.bounceRate || 'N/A')}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Pages/Visit</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.your?.pagesPerVisit === 'number' 
                        ? comparison.traffic.your.pagesPerVisit.toFixed(1)
                        : (comparison?.traffic?.your?.pagesPerVisit || 'N/A')}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Avg Duration</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.your?.avgVisitDuration === 'number' 
                        ? `${Math.floor(comparison.traffic.your.avgVisitDuration / 60)}m ${comparison.traffic.your.avgVisitDuration % 60}s`
                        : (comparison?.traffic?.your?.avgVisitDuration || 'N/A')}
                    </div>
                  </div>
                </div>
                {comparison?.traffic?.your?.trafficSources && Object.keys(comparison.traffic.your.trafficSources).length > 0 && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="text-sm font-semibold mb-3">Traffic Sources</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.traffic.your.trafficSources).map(([source, value]: [string, any]) => (
                        typeof value === 'number' && value > 0 && (
                          <div key={source} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{source}</span>
                            <span className="font-semibold">{value.toFixed(1)}%</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Competitor Traffic */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {competitorSite.domain}
                  {comparison?.traffic?.winner === 'competitor' && (
                    <Badge className="bg-green-600">Higher Traffic</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="text-xs text-red-700 font-medium">Monthly Visits</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                      {typeof comparison?.traffic?.competitor?.monthlyVisits === 'number' 
                        ? comparison.traffic.competitor.monthlyVisits.toLocaleString()
                        : (comparison?.traffic?.competitor?.monthlyVisits || 'N/A')}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Source: {comparison?.traffic?.competitor?.source === 'similarweb_rapidapi' ? 'SimilarWeb' : 
                               (comparison?.traffic?.competitor?.source || 'Unknown')}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Bounce Rate</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.competitor?.bounceRate === 'number' 
                        ? `${comparison.traffic.competitor.bounceRate.toFixed(1)}%`
                        : (comparison?.traffic?.competitor?.bounceRate || 'N/A')}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Pages/Visit</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.competitor?.pagesPerVisit === 'number' 
                        ? comparison.traffic.competitor.pagesPerVisit.toFixed(1)
                        : (comparison?.traffic?.competitor?.pagesPerVisit || 'N/A')}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Avg Duration</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {typeof comparison?.traffic?.competitor?.avgVisitDuration === 'number' 
                        ? `${Math.floor(comparison.traffic.competitor.avgVisitDuration / 60)}m ${comparison.traffic.competitor.avgVisitDuration % 60}s`
                        : (comparison?.traffic?.competitor?.avgVisitDuration || 'N/A')}
                    </div>
                  </div>
                </div>
                {comparison?.traffic?.competitor?.trafficSources && Object.keys(comparison.traffic.competitor.trafficSources).length > 0 && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="text-sm font-semibold mb-3">Traffic Sources</h4>
                    <div className="space-y-2">
                      {Object.entries(comparison.traffic.competitor.trafficSources).map(([source, value]: [string, any]) => (
                        typeof value === 'number' && value > 0 && (
                          <div key={source} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{source}</span>
                            <span className="font-semibold">{value.toFixed(1)}%</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Gap Insight */}
            {comparison?.traffic?.difference && comparison.traffic.difference !== 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Traffic Gap</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {comparison?.traffic?.winner === 'yours' 
                        ? `Your site has ${Math.abs(comparison.traffic.difference).toLocaleString()} more monthly visits than the competitor.`
                        : `Competitor has ${Math.abs(comparison.traffic.difference).toLocaleString()} more monthly visits. Consider improving your SEO and content marketing strategy.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Updates (ChangeDetection.io) */}
      {(yourSite?.contentChanges?.success || competitorSite?.contentChanges?.success) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!yourSite?.contentChanges?.success && !competitorSite?.contentChanges?.success ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-600">Content updates data not available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bar Chart Visualization */}
                <div className="h-64 flex items-end justify-center gap-8 px-4">
                  {/* Your Updates Bar */}
                  <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg flex items-end justify-center" style={{height: '200px'}}>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex items-end justify-center pb-2 transition-all duration-500"
                        style={{
                          height: `${Math.min((yourSite?.contentChanges?.monitoring?.changeCount || 0) * 10, 100)}%`,
                          minHeight: '20px'
                        }}
                      >
                        <span className="text-white font-bold text-lg">
                          {yourSite?.contentChanges?.monitoring?.changeCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700">Your Updates</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {yourSite?.contentChanges?.activity?.activityLevel || 'No data'}
                      </div>
                    </div>
                  </div>

                  {/* Competitor Updates Bar */}
                  <div className="flex-1 max-w-[200px] flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg flex items-end justify-center" style={{height: '200px'}}>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg flex items-end justify-center pb-2 transition-all duration-500"
                        style={{
                          height: `${Math.min((competitorSite?.contentChanges?.monitoring?.changeCount || 0) * 10, 100)}%`,
                          minHeight: '20px'
                        }}
                      >
                        <span className="text-white font-bold text-lg">
                          {competitorSite?.contentChanges?.monitoring?.changeCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700">Competitor's Updates</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {competitorSite?.contentChanges?.activity?.activityLevel || 'No data'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Your Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Competitor's Updates</span>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {/* Your Site Stats */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">{yourSite?.domain || 'Your Site'}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Change Count:</span>
                        <span className="font-semibold">{yourSite?.contentChanges?.monitoring?.changeCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check Count:</span>
                        <span className="font-semibold">{yourSite?.contentChanges?.monitoring?.checkCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Activity:</span>
                        <span className="font-semibold capitalize">{yourSite?.contentChanges?.activity?.activityLevel || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Changed:</span>
                        <span className="font-semibold text-xs">
                          {yourSite?.contentChanges?.monitoring?.lastChanged 
                            ? new Date(yourSite.contentChanges.monitoring.lastChanged * 1000).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Competitor Stats */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">{competitorSite?.domain || 'Competitor'}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Change Count:</span>
                        <span className="font-semibold">{competitorSite?.contentChanges?.monitoring?.changeCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check Count:</span>
                        <span className="font-semibold">{competitorSite?.contentChanges?.monitoring?.checkCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Activity:</span>
                        <span className="font-semibold capitalize">{competitorSite?.contentChanges?.activity?.activityLevel || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Changed:</span>
                        <span className="font-semibold text-xs">
                          {competitorSite?.contentChanges?.monitoring?.lastChanged 
                            ? new Date(competitorSite.contentChanges.monitoring.lastChanged * 1000).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Media Engagement Section */}
      {(showInstagramCard || showFacebookCard) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📱 Social Media Engagement
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Instagram Engagement Comparison */}
            {(comparison?.instagram || yourSite?.instagram || competitorSite?.instagram) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    📸 Instagram Engagement
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Instagram metrics comparison
                  </CardDescription>
                </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Instagram */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  @{comparison?.instagram?.your?.username || yourSite?.instagram?.profile?.username || 'N/A'}
                  {comparison?.instagram?.your?.verified && (
                    <Badge className="bg-blue-600">✓ Verified</Badge>
                  )}
                  {comparison?.instagram?.winner?.engagement === 'yours' && (
                    <Badge className="bg-green-600">Better Engagement</Badge>
                  )}
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-100 rounded-lg">
                    <div className="text-xs text-purple-700 font-medium">Followers</div>
                    <div className="text-2xl font-bold text-purple-900 mt-1">
                      {(comparison?.instagram?.your?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium">Engagement Rate</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                      {comparison?.instagram?.your?.engagementRate || '0%'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white border rounded-lg">
                    <div className="text-xs text-gray-600">Avg Interactions</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {(comparison?.instagram?.your?.avgInteractions || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white border rounded-lg">
                    <div className="text-xs text-gray-600">Consistency</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">
                      {comparison?.instagram?.your?.consistency || 'N/A'}
                    </div>
                  </div>
                </div>

                {comparison?.instagram?.your?.bestPostingDays && comparison.instagram.your.bestPostingDays.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2">🎯 Best Posting Times</p>
                    <div className="text-sm text-green-900">
                      <p><strong>Days:</strong> {comparison.instagram.your.bestPostingDays.join(', ')}</p>
                      {comparison?.instagram?.your?.bestPostingHours && (
                        <p className="mt-1"><strong>Hours:</strong> {comparison.instagram.your.bestPostingHours.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Competitor Instagram */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  @{comparison?.instagram?.competitor?.username || competitorSite?.instagram?.profile?.username || 'N/A'}
                  {comparison?.instagram?.competitor?.verified && (
                    <Badge className="bg-blue-600">✓ Verified</Badge>
                  )}
                  {comparison?.instagram?.winner?.engagement === 'competitor' && (
                    <Badge className="bg-green-600">Better Engagement</Badge>
                  )}
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-lg">
                    <div className="text-xs text-red-700 font-medium">Followers</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                      {(comparison?.instagram?.competitor?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg">
                    <div className="text-xs text-orange-700 font-medium">Engagement Rate</div>
                    <div className="text-2xl font-bold text-orange-900 mt-1">
                      {comparison?.instagram?.competitor?.engagementRate || '0%'}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white border rounded-lg">
                    <div className="text-xs text-gray-600">Avg Interactions</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {(comparison?.instagram?.competitor?.avgInteractions || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white border rounded-lg">
                    <div className="text-xs text-gray-600">Consistency</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">
                      {comparison?.instagram?.competitor?.consistency || 'N/A'}
                    </div>
                  </div>
                </div>

                {comparison?.instagram?.competitor?.bestPostingDays && comparison.instagram.competitor.bestPostingDays.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2">🎯 Best Posting Times</p>
                    <div className="text-sm text-green-900">
                      <p><strong>Days:</strong> {comparison.instagram.competitor.bestPostingDays.join(', ')}</p>
                      {comparison?.instagram?.competitor?.bestPostingHours && (
                        <p className="mt-1"><strong>Hours:</strong> {comparison.instagram.competitor.bestPostingHours.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instagram Insight */}
            {comparison?.instagram && (
              <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <p className="font-semibold text-pink-900">Instagram Strategy Insight</p>
                    <p className="text-sm text-pink-700 mt-1">
                      {comparison.instagram.winner.followers === 'yours' 
                        ? `You have ${((comparison.instagram.your.followers - comparison.instagram.competitor.followers) / comparison.instagram.competitor.followers * 100).toFixed(0)}% more followers than your competitor. `
                        : `Your competitor has ${((comparison.instagram.competitor.followers - comparison.instagram.your.followers) / comparison.instagram.your.followers * 100).toFixed(0)}% more followers. Consider increasing posting frequency and engagement. `}
                      {comparison.instagram.winner.engagement === 'yours'
                        ? 'Your engagement rate is higher - keep up the great content!'
                        : 'Focus on improving engagement rate through interactive content and optimal posting times.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Facebook Engagement Comparison */}
      {(comparison?.facebook || yourSite?.facebook || competitorSite?.facebook) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              📘 Facebook Engagement
            </CardTitle>
            <CardDescription className="text-sm">
              Facebook page metrics comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Facebook */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {comparison?.facebook?.your?.pageName || yourSite?.facebook?.profile?.name || 'Your Page'}
                  {comparison?.facebook?.winner?.engagement === 'yours' && (
                    <Badge className="bg-green-600 text-xs">Higher Engagement</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium">Followers</div>
                    <div className="text-xl font-bold text-blue-900 mt-1">
                      {(comparison?.facebook?.your?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <div className="text-xs text-indigo-700 font-medium">Likes</div>
                    <div className="text-xl font-bold text-indigo-900 mt-1">
                      {(comparison?.facebook?.your?.likes || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-xs text-purple-700 font-medium">Talking About</div>
                    <div className="text-lg font-bold text-purple-900 mt-1">
                      {(comparison?.facebook?.your?.talkingAbout || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-xs text-green-700 font-medium">Engagement</div>
                    <div className="text-lg font-bold text-green-900 mt-1">
                      {comparison?.facebook?.your?.engagementRate || '0%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor Facebook */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {comparison?.facebook?.competitor?.pageName || competitorSite?.facebook?.profile?.name || 'Competitor Page'}
                  {comparison?.facebook?.winner?.engagement === 'competitor' && (
                    <Badge className="bg-green-600 text-xs">Higher Engagement</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <div className="text-xs text-red-700 font-medium">Followers</div>
                    <div className="text-xl font-bold text-red-900 mt-1">
                      {(comparison?.facebook?.competitor?.followers || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-xs text-orange-700 font-medium">Likes</div>
                    <div className="text-xl font-bold text-orange-900 mt-1">
                      {(comparison?.facebook?.competitor?.likes || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                    <div className="text-xs text-pink-700 font-medium">Talking About</div>
                    <div className="text-lg font-bold text-pink-900 mt-1">
                      {(comparison?.facebook?.competitor?.talkingAbout || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                    <div className="text-xs text-teal-700 font-medium">Engagement</div>
                    <div className="text-lg font-bold text-teal-900 mt-1">
                      {comparison?.facebook?.competitor?.engagementRate || '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

          </div>
        </div>
      )}
      {/* End of Social Media Section */}

      </div>
      {/* End of Grid Layout */}

      {/* AI-Powered Recommendations */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Recommendations
            </div>
            {!showAIRecommendations && (
              <Button 
                onClick={fetchAIRecommendations}
                disabled={isLoadingAI}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Get personalized, AI-generated recommendations based on deep analysis of your site vs competitor
          </CardDescription>
        </CardHeader>
        
        {showAIRecommendations && (
          <CardContent className="space-y-6">
            {aiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Failed to generate AI recommendations</p>
                  <p className="text-sm text-red-700 mt-1">{aiError}</p>
                  <Button
                    onClick={fetchAIRecommendations}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-700 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {!aiError && aiRecommendations.length > 0 && (
              <>
                {/* Fallback Notice */}
                {isFallback && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">AI Service Temporarily Busy</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Google's AI is experiencing high traffic. Showing general recommendations below. 
                        Try again in a few minutes for personalized insights.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Display AI-Generated Recommendations */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-purple-700 mb-4">
                    <Target className="h-5 w-5" />
                    🎯 {isFallback ? 'General' : 'AI-Generated'} Recommendations
                  </h3>
                  <div className="space-y-3">
                    {aiRecommendations.map((rec, index) => (
                      <AIRecommendationCard
                        key={index}
                        title={rec.title}
                        impact={rec.impact}
                        effort={rec.effort}
                        description={rec.description}
                        steps={rec.steps}
                      />
                    ))}
                  </div>
                </div>

                {/* AI Analysis Info */}
                {!isFallback && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-purple-900">Powered by Google Gemini AI</p>
                        <p className="text-purple-700 mt-1">
                          These recommendations are generated using advanced AI analysis of your site's performance, 
                          SEO metrics, content quality, and direct comparison with your competitor's strengths.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
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
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <div className="flex gap-2">
          <Badge className={`text-xs ${getImpactColor(impact)} border`}>
            Impact: {impact}
          </Badge>
          <Badge className={`text-xs ${getEffortColor(effort)} border`}>
            Effort: {effort}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-700">Action Steps:</p>
        <ul className="space-y-1">
          {steps.map((step, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
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
  // Provide safe defaults
  const safeData = data || {};
  const safeHeadings = headings || {};
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">Title Tag</span>
        {safeData.hasTitle ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">Meta Description</span>
        {safeData.hasDescription ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">H1 Tags</span>
        <Badge variant="outline">{safeHeadings.h1Count || 0}</Badge>
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm">H2 Tags</span>
        <Badge variant="outline">{safeHeadings.h2Count || 0}</Badge>
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
