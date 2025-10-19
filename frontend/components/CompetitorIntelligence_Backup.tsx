'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Search, TrendingUp, Target, AlertCircle, Clock, Plus, FileText, ChevronDown, ChevronUp, X, Globe, Instagram as InstagramIcon, Facebook as FacebookIcon } from 'lucide-react'
import CompetitorResults from './CompetitorResults'
import { createClient } from '@/utils/supabase/client'

interface Competitor {
  id: string
  domain: string
  instagram: string
  facebook: string
}

export default function CompetitorIntelligence() {
  const [userDomain, setUserDomain] = useState<string>('')
  const [yourInstagram, setYourInstagram] = useState('')
  const [yourFacebook, setYourFacebook] = useState('')
  const [userSocialOpen, setUserSocialOpen] = useState(false)
  
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [newCompetitorDomain, setNewCompetitorDomain] = useState('')
  const [newCompetitorInstagram, setNewCompetitorInstagram] = useState('')
  const [newCompetitorFacebook, setNewCompetitorFacebook] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [loadingDomain, setLoadingDomain] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isCached, setIsCached] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null)

  // Get user email and domain on mount
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        await fetchUserDomain(user.email)
      }
      setLoadingDomain(false)
    }
    init()
  }, [])

  const fetchUserDomain = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:3010/api/search-console/sites?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sites && data.sites.length > 0) {
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
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return urlPattern.test(url)
  }

  const cleanUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  const handleAddCompetitor = () => {
    if (!newCompetitorDomain) {
      setError('Please enter competitor domain')
      return
    }

    if (!validateUrl(newCompetitorDomain)) {
      setError('Please enter a valid domain')
      return
    }

    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      domain: cleanUrl(newCompetitorDomain),
      instagram: newCompetitorInstagram,
      facebook: newCompetitorFacebook
    }

    setCompetitors([...competitors, newCompetitor])
    setNewCompetitorDomain('')
    setNewCompetitorInstagram('')
    setNewCompetitorFacebook('')
    setShowAddCompetitor(false)
    setError('')
  }

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id))
    if (selectedCompetitor?.id === id) {
      setSelectedCompetitor(null)
      setResults(null)
    }
  }

  const handleAnalyze = async (competitor: Competitor) => {
    setError('')
    setResults(null)
    setIsCached(false)
    setSelectedCompetitor(competitor)

    if (!userDomain) {
      setError('Your domain could not be detected. Please connect Google Search Console first.')
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
        competitorSite: competitor.domain,
        yourInstagram: yourInstagram || undefined,
        competitorInstagram: competitor.instagram || undefined,
        yourFacebook: yourFacebook || undefined,
        competitorFacebook: competitor.facebook || undefined,
        forceRefresh: false,
      }
      
      console.log('🔍 Sending request to /api/competitor/analyze:', requestBody)
      
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
      console.log('✅ Received response:', data)
      
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitor Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Compare your website with competitors to identify opportunities and gaps
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Your Site & Competitors */}
        <div className="lg:col-span-1 space-y-4">
          {/* Your Site Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Your Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingDomain ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting domain...
                </div>
              ) : userDomain ? (
                <>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="font-semibold text-lg">{userDomain}</p>
                  </div>

                  {/* Social Media Toggle */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-between"
                    onClick={() => setUserSocialOpen(!userSocialOpen)}
                  >
                    <span className="text-xs font-medium">Add Social Media</span>
                    {userSocialOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {userSocialOpen && (
                    <div className="space-y-3 mt-3 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label htmlFor="yourInstagram" className="text-xs flex items-center gap-1">
                          <InstagramIcon className="h-3 w-3" />
                          Instagram Username
                        </Label>
                        <Input
                          id="yourInstagram"
                          type="text"
                          placeholder="your_username"
                          value={yourInstagram}
                          onChange={(e) => setYourInstagram(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yourFacebook" className="text-xs flex items-center gap-1">
                          <FacebookIcon className="h-3 w-3" />
                          Facebook Page
                        </Label>
                        <Input
                          id="yourFacebook"
                          type="text"
                          placeholder="your_page"
                          value={yourFacebook}
                          onChange={(e) => setYourFacebook(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Connect Google Search Console to detect your domain
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Competitors Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Competitors ({competitors.length})
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAddCompetitor(true)}
                  className="h-7 text-xs"
                  disabled={!userDomain}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Add Competitor Form */}
              {showAddCompetitor && (
                <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newCompDomain" className="text-xs">Domain *</Label>
                      <Input
                        id="newCompDomain"
                        placeholder="competitor.com"
                        value={newCompetitorDomain}
                        onChange={(e) => setNewCompetitorDomain(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCompInsta" className="text-xs flex items-center gap-1">
                        <InstagramIcon className="h-3 w-3" />
                        Instagram
                      </Label>
                      <Input
                        id="newCompInsta"
                        placeholder="username"
                        value={newCompetitorInstagram}
                        onChange={(e) => setNewCompetitorInstagram(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCompFb" className="text-xs flex items-center gap-1">
                        <FacebookIcon className="h-3 w-3" />
                        Facebook
                      </Label>
                      <Input
                        id="newCompFb"
                        placeholder="page_name"
                        value={newCompetitorFacebook}
                        onChange={(e) => setNewCompetitorFacebook(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleAddCompetitor}
                        className="flex-1 h-8 text-xs"
                      >
                        Add Competitor
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setShowAddCompetitor(false)
                          setNewCompetitorDomain('')
                          setNewCompetitorInstagram('')
                          setNewCompetitorFacebook('')
                        }}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competitor List */}
              {competitors.length === 0 && !showAddCompetitor && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No competitors added yet</p>
                  <p className="text-xs mt-1">Click "Add" to start</p>
                </div>
              )}

              {competitors.map((competitor) => (
                <Card 
                  key={competitor.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCompetitor?.id === competitor.id 
                      ? 'border-2 border-primary bg-primary/5' 
                      : 'border hover:border-primary/50'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                            {competitor.domain.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-sm truncate">{competitor.domain}</p>
                        </div>
                        
                        {(competitor.instagram || competitor.facebook) && (
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {competitor.instagram && (
                              <span className="flex items-center gap-1">
                                <InstagramIcon className="h-3 w-3" />
                                {competitor.instagram}
                              </span>
                            )}
                            {competitor.facebook && (
                              <span className="flex items-center gap-1">
                                <FacebookIcon className="h-3 w-3" />
                                {competitor.facebook}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleAnalyze(competitor)}
                            disabled={loading}
                            className="flex-1 h-7 text-xs"
                          >
                            {loading && selectedCompetitor?.id === competitor.id ? (
                              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing...</>
                            ) : (
                              <><Search className="h-3 w-3 mr-1" /> Analyze</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCompetitor(competitor.id)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Results */}
        <div className="lg:col-span-2">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold">Analyzing Competitor...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comparing SEO, performance, traffic, and social media metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !results && !error && (
            <Card className="border-dashed border-2">
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Ready to Analyze</p>
                  <p className="text-sm mt-2">
                    Add a competitor and click "Analyze" to view detailed comparison
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {results && !loading && (
            <div className="space-y-4">
              {isCached && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Cached Results</AlertTitle>
                  <AlertDescription>
                    Showing cached analysis. Results are updated periodically.
                  </AlertDescription>
                </Alert>
              )}
              <CompetitorResults data={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
