'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface GoogleAnalyticsCardProps {
  userEmail?: string
}

export default function GoogleAnalyticsCard({ userEmail = 'test@example.com' }: GoogleAnalyticsCardProps) {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const checkGoogleConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setGoogleConnected(data.connected || false)
      } else {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error checking Google Analytics connection:', error)
      setGoogleConnected(false)
    } finally {
      setCheckingConnection(false)
    }
  }

  const connectGoogleAnalytics = () => {
    setGoogleLoading(true)
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(userEmail)}`
  }

  const disconnectGoogleAnalytics = async () => {
    setGoogleLoading(true)
    try {
      const response = await fetch(`http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST'
      })
      if (response.ok) {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error disconnecting Google Analytics:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    checkGoogleConnection()
    
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const errorParam = urlParams.get('error')
    
    if (success) {
      setGoogleConnected(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (errorParam) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Google Analytics Integration
            </CardTitle>
          </div>
          {checkingConnection && (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
              googleConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {googleConnected ? 'Connected' : 'Not Connected'}
                </span>
                {googleConnected && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {googleConnected 
                  ? 'Your Google Analytics account is connected and ready to use.' 
                  : 'Connect your Google Analytics account to get deeper insights.'}
              </p>
            </div>
          </div>

          {/* Benefits List */}
          {!googleConnected && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Benefits of Connecting:
              </p>
              <ul className="space-y-2">
                {[
                  'Real-time traffic analytics',
                  'User behavior insights',
                  'Conversion tracking',
                  'Audience demographics'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {googleConnected ? (
              <Button
                onClick={disconnectGoogleAnalytics}
                disabled={googleLoading}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect Account'
                )}
              </Button>
            ) : (
              <Button
                onClick={connectGoogleAnalytics}
                disabled={googleLoading}
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Connect Google Analytics
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}