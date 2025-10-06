'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestStripePage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testStripeConnection = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch('/api/test-stripe')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Failed to test Stripe connection' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStripeConnection}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Stripe Connection'
              )}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {results.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {results.success ? 'Stripe Connected!' : 'Connection Failed'}
                  </span>
                </div>

                {results.config && (
                  <div className="bg-gray-100 p-4 rounded space-y-2 text-sm">
                    <div><strong>Publishable Key:</strong> {results.config.publishableKey ? '✅ Set' : '❌ Missing'}</div>
                    <div><strong>Secret Key:</strong> {results.config.secretKey ? '✅ Set' : '❌ Missing'}</div>
                    <div><strong>Mode:</strong> {results.config.mode}</div>
                  </div>
                )}

                {results.error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
                    {results.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}