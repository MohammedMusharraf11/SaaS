'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, TrendingUp, Users, Globe, AlertCircle } from 'lucide-react'
import CompetitorResults from './CompetitorResults'

export default function CompetitorIntelligence() {
  const [yourSiteUrl, setYourSiteUrl] = useState('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<any>(null)

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

    // Validation
    if (!yourSiteUrl || !competitorUrl) {
      setError('Please enter both URLs')
      return
    }

    if (!validateUrl(yourSiteUrl)) {
      setError('Please enter a valid URL for your site')
      return
    }

    if (!validateUrl(competitorUrl)) {
      setError('Please enter a valid URL for competitor site')
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
          yourSite: cleanUrl(yourSiteUrl),
          competitorSite: cleanUrl(competitorUrl),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze competitors')
      }

      const data = await response.json()
      setResults(data)
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
            <Search className="h-5 w-5" />
            Enter URLs to Compare
          </CardTitle>
          <CardDescription>
            Provide your website URL and your competitor's URL to start the analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Your Site URL */}
              <div className="space-y-2">
                <Label htmlFor="yourSite" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Your Website URL
                </Label>
                <Input
                  id="yourSite"
                  type="text"
                  placeholder="example.com"
                  value={yourSiteUrl}
                  onChange={(e) => setYourSiteUrl(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your website domain (e.g., yoursite.com)
                </p>
              </div>

              {/* Competitor Site URL */}
              <div className="space-y-2">
                <Label htmlFor="competitorSite" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Competitor Website URL
                </Label>
                <Input
                  id="competitorSite"
                  type="text"
                  placeholder="competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter competitor domain (e.g., competitor.com)
                </p>
              </div>
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
      {results && <CompetitorResults data={results} />}

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
