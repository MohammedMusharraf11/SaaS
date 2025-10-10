import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { yourSite, competitorSite } = body

    if (!yourSite || !competitorSite) {
      return NextResponse.json(
        { error: 'Both yourSite and competitorSite URLs are required' },
        { status: 400 }
      )
    }

    // Call backend competitor analysis API
    console.log('Calling backend API for competitor analysis...');
    
    const response = await fetch('http://localhost:3010/api/competitor/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        yourSite,
        competitorSite,
      }),
    })

    if (!response.ok) {
      throw new Error('Backend analysis failed')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Competitor analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze competitors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
