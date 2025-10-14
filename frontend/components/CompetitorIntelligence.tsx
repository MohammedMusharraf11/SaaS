'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Search, TrendingUp, Target, AlertCircle, Clock, Plus } from 'lucide-react'
import CompetitorResults from './CompetitorResults'
import { createClient } from '@/utils/supabase/client'

export default function CompetitorIntelligence() {
  const [userDomain, setUserDomain] = useState<string>('')
  const [competitorUrl, setCompetitorUrl] = useState('')
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
      const response = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          yourSite: cleanUrl(userDomain),
          competitorSite: cleanUrl(competitorUrl),
          forceRefresh: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze competitors')
      }

      const data = await response.json()
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

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SEO Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Compare meta tags, keywords, and on-page SEO elements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Analyze page speed, load times, and Core Web Vitals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Content Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Review content strategy, keyword usage, and structure
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
