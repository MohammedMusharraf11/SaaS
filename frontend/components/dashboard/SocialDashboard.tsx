"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, BarChart3, TrendingUp, Award } from 'lucide-react'
import SocialWidgets from './SocialWidgets'

export default function SocialDashboard() {
  const [timeframe, setTimeframe] = useState('30')
  const [competitors, setCompetitors] = useState('')
  const [platforms, setPlatforms] = useState('facebook,linkedin')

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Performance</h1>
            <p className="text-sm text-gray-600 mt-1">Engagement, follower trends, top posts and competitor benchmarks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select onValueChange={(v) => setTimeframe(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Competitors (comma separated)"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="w-72"
            />

            <Select onValueChange={(v) => setPlatforms(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook,linkedin">LinkedIn / Facebook (Starter)</SelectItem>
                <SelectItem value="all">All platforms (Growth)</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Update</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold">78</h3>
                    <p className="text-sm text-gray-600 mt-1">Engagement score across selected platforms vs industry average</p>
                    <div className="mt-3 flex gap-2">
                      <Badge>Likes</Badge>
                      <Badge>Comments</Badge>
                      <Badge>Shares</Badge>
                    </div>
                  </div>
                  <div className="w-80 h-40 bg-gradient-to-r from-orange-500 to-orange-300 rounded flex items-center justify-center text-white">
                    <div className="text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">+12% vs industry</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Follower Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 bg-white rounded border border-gray-100 flex items-center justify-center text-gray-400">
                  {/* Placeholder for growth chart */}
                  <p>Growth chart placeholder (mock data)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Top Performing Posts</CardTitle>
                <div className="text-sm text-gray-500">Sorted by engagement</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-100">
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">Img</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Post title {i}</h4>
                          <div className="text-sm text-gray-500">Engagement: {Math.floor(Math.random()*5000)}</div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Content type: Image / Video / Text</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SocialWidgets />
          </div>
        </div>
      </div>
    </div>
  )
}
