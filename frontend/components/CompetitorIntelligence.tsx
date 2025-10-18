'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Search, TrendingUp, Target, AlertCircle, Clock, Plus, FileText } from 'lucide-react'
import CompetitorResults from './CompetitorResults'
import { createClient } from '@/utils/supabase/client'

export default function CompetitorIntelligence() {
  const [userDomain, setUserDomain] = useState<string>('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [yourInstagram, setYourInstagram] = useState('')
  const [competitorInstagram, setCompetitorInstagram] = useState('')
  const [yourFacebook, setYourFacebook] = useState('')
  const [competitorFacebook, setCompetitorFacebook] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDomain, setLoadingDomain] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isCached, setIsCached] = useState(false)

  // Get user email and domain on mount
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        // Fetch user's domain from Search Console or Google Analytics cache
        await fetchUserDomain(user.email)
      }
      setLoadingDomain(false)
    }
    init()
  }, [])

  const fetchUserDomain = async (email: string) => {
    try {
      // Try to get domain from Search Console sites
      const response = await fetch(`http://localhost:3010/api/search-console/sites?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sites && data.sites.length > 0) {
          // Extract domain from siteUrl (remove https:// or sc-domain: prefix)
          let domain = data.sites[0].siteUrl
          domain = domain.replace(/^https?:\/\//, '').replace(/^sc-domain:/, '').replace(/\/$/, '')
          setUserDomain(domain)
          console.log('✅ User domain found:', domain)
          return
        }
      }
      
      console.log('📭 No domain found in Search Console')
    } catch (error) {
      console.error('Failed to fetch user domain:', error)
    }
  }

  const validateUrl = (url: string) => {
    if (!url) return false
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return urlPattern.test(url)
  }

  const cleanUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResults(null)
    setIsCached(false)

    // Validation
    if (!competitorUrl) {
      setError('Please enter competitor URL')
      return
    }

    if (!userDomain) {
      setError('Your domain could not be detected. Please connect Google Search Console first.')
      return
    }

    if (!validateUrl(competitorUrl)) {
      setError('Please enter a valid URL for competitor site')
      return
    }

    if (!userEmail) {
      setError('User session not found. Please refresh the page.')
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        email: userEmail,
        yourSite: cleanUrl(userDomain),
        competitorSite: cleanUrl(competitorUrl),
        yourInstagram: yourInstagram || undefined,
        competitorInstagram: competitorInstagram || undefined,
        yourFacebook: yourFacebook || undefined,
        competitorFacebook: competitorFacebook || undefined,
        forceRefresh: false,
      };
      
      console.log('🔍 Sending request to /api/competitor/analyze:');
      console.log('   Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('   Instagram fields filled?', {
        yourInstagram: !!yourInstagram,
        competitorInstagram: !!competitorInstagram
      });
      console.log('   Facebook fields filled?', {
        yourFacebook: !!yourFacebook,
        competitorFacebook: !!competitorFacebook
      });
      
      const response = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze competitors')
      }

      const data = await response.json()
      console.log('✅ Received response from /api/competitor/analyze:');
      console.log('   Has instagram data:', !!data.yourSite?.instagram || !!data.competitorSite?.instagram || !!data.comparison?.instagram);
      console.log('   Has facebook data:', !!data.yourSite?.facebook || !!data.competitorSite?.facebook || !!data.comparison?.facebook);
      console.log('   Full response:', data);
      
      setResults(data)
      setIsCached(data.cached || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Competitor Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Compare your website with competitors to identify opportunities and gaps
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analyze Competitor
          </CardTitle>
          <CardDescription>
            Enter your competitor's URL to compare with your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* User Domain Display */}
            {loadingDomain ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Detecting your domain...
              </div>
            ) : userDomain ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Your Website</p>
                  <p className="font-medium">{userDomain}</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connect Google Search Console</AlertTitle>
                <AlertDescription>
                  Please connect your Google Search Console to automatically detect your domain.
                </AlertDescription>
              </Alert>
            )}

            {/* Competitor Site URL */}
            <div className="space-y-2">
              <Label htmlFor="competitorSite" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Competitor Website URL
              </Label>
              <Input
                id="competitorSite"
                type="text"
                placeholder="competitor.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                disabled={loading || !userDomain}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter competitor domain (e.g., competitor.com)
              </p>
            </div>

            {/* Social Media Usernames - Optional */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                📱 Social Media (Optional)
                <span className="text-xs font-normal text-muted-foreground">
                  - Add for engagement comparison
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Instagram Usernames */}
                <div className="space-y-3">
                  <Label htmlFor="yourInstagram" className="text-xs font-medium">
                    📸 Your Instagram Username
                  </Label>
                  <Input
                    id="yourInstagram"
                    type="text"
                    placeholder="your_username"
                    value={yourInstagram}
                    onChange={(e) => setYourInstagram(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="competitorInstagram" className="text-xs font-medium">
                    📸 Competitor Instagram Username
                  </Label>
                  <Input
                    id="competitorInstagram"
                    type="text"
                    placeholder="competitor_username"
                    value={competitorInstagram}
                    onChange={(e) => setCompetitorInstagram(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                {/* Facebook Usernames */}
                <div className="space-y-3">
                  <Label htmlFor="yourFacebook" className="text-xs font-medium">
                    📘 Your Facebook Page (for Meta Ads Monitoring)
                  </Label>
                  <Input
                    id="yourFacebook"
                    type="text"
                    placeholder="e.g., nike, cocacola, teslamotors"
                    value={yourFacebook}
                    onChange={(e) => setYourFacebook(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Enter Facebook page name to monitor Meta Ads (optional)</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="competitorFacebook" className="text-xs font-medium">
                    📘 Competitor Facebook Page (for Meta Ads Monitoring)
                  </Label>
                  <Input
                    id="competitorFacebook"
                    type="text"
                    placeholder="e.g., pepsi, redbull, adidas"
                    value={competitorFacebook}
                    onChange={(e) => setCompetitorFacebook(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Enter Facebook page name to monitor Meta Ads (optional)</p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>Instagram:</strong> Enter username from instagram.com/<strong>username</strong> | <strong>Facebook:</strong> Enter page name from facebook.com/<strong>pagename</strong>
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze Competition
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <>
          {isCached && (
            <Alert className="bg-blue-50 border-blue-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Results loaded from cache (7-day cache). Data is up to 7 days old.{' '}
                <button 
                  onClick={() => {
                    setResults(null)
                    handleAnalyze({ preventDefault: () => {} } as React.FormEvent)
                  }}
                  className="underline font-medium"
                >
                  Refresh now
                </button>
              </AlertDescription>
            </Alert>
          )}
          <CompetitorResults data={results} />
        </>
      )}

      {/* Redesigned Competitor Intelligence Dashboard (Traffic, Content Updates, Market Share, Paid Ads) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Top row: Traffic (left) and Content Updates (right) */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Website Traffic (Referral)
                </div>
                <div className="text-xs text-muted-foreground">Your vs Competitor</div>
              </CardTitle>
              <CardDescription>
                Organic & referral traffic trends (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 bg-white border border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Chart placeholder
              </div>
            </CardContent>
          </Card>

          {/* Market Share card below Traffic */}
          <Card className="bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Market Share (Visibility)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2">
                  <div className="h-40 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full bg-white shadow flex items-center justify-center text-2xl font-bold">61%</div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Your market share vs Competitor</p>
                  <div className="mt-4">
                    <Button className="bg-orange-500 text-white">View Full Report</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Updates
              </CardTitle>
              <CardDescription>
                Publishing frequency and content freshness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-white border border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                Bar chart placeholder
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Paid Ads Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <table className="w-full text-left text-xs">
                  <tbody>
                    <tr>
                      <td className="py-2">Visibility index</td>
                      <td className="py-2">57% / 43%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2">Active Ads (detected)</td>
                      <td className="py-2">25 / 19</td>
                    </tr>
                    <tr>
                      <td className="py-2">Spend signal</td>
                      <td className="py-2">High ($10-15k est.) / Medium ($7-10k)</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4">
                  <Button className="bg-orange-500 text-white">View Full Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
