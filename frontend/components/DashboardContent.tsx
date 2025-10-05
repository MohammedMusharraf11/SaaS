'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical, ChevronDown, ArrowRight, CheckSquare, Square } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import GoogleAnalyticsCard from './GoogleAnalyticsCard'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface QuickWin {
  id: string
  title: string
  description: string
  completed: boolean
}

interface DashboardContentProps {
  userEmail?: string
}

const quickWins: QuickWin[] = [
  { id: '1', title: 'Optimize Page Title', description: 'Lorem ipsum dolor sit amet', completed: false },
  { id: '2', title: 'Publish a new blog post targeting', description: 'Lorem ipsum dolor sit amet', completed: false },
  { id: '3', title: 'Secure 2 new backlinks blogs', description: 'Lorem ipsum dolor sit amet', completed: false },
]

export default function DashboardContent({ userEmail }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState('Social Metrics')
  const [selectedCompetitor, setSelectedCompetitor] = useState('Select Competitor')
  const [selectedDays, setSelectedDays] = useState('Last 7 days')

  // Website Traffic Chart Data
  const trafficData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    datasets: [
      {
        label: 'Traffic 1',
        data: [20, 35, 25, 45, 30, 50, 40, 55, 45, 60, 50, 65, 55],
        borderColor: '#FF6B00',
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Traffic 2',
        data: [30, 25, 40, 35, 50, 45, 55, 50, 60, 55, 65, 60, 70],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: '#f0f0f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const competitorData = [
    { metric: 'Domain Authority', yourSite: 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
    { metric: 'Monthly Traffic', yourSite: 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
    { metric: 'Social Followers', yourSite: 55, competitorA: 62, competitorB: 58, competitorC: 78, competitorD: 43 },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, John!</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left & Center */}
          <div className="lg:col-span-2 space-y-6">
            {/* Google Analytics Card */}
            <GoogleAnalyticsCard userEmail={userEmail} />

            {/* Health Score Card */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    Website
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    SEO
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium bg-primary-50 text-primary rounded-lg border border-primary"
                  >
                    Social Metrics
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  {/* Health Score Circle */}
                  <div className="flex-shrink-0">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="#10B981"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${82 * 5.024} ${100 * 5.024}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">82</span>
                        <span className="text-2xl text-gray-400">/100</span>
                        <span className="text-sm font-medium text-green-600 mt-1">Good</span>
                      </div>
                    </div>
                  </div>

                  {/* Health Score Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Health Score</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                      incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website Traffic Chart */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900">Website Traffic</CardTitle>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={trafficData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Competitor Benchmarking */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Competitor Benchmarking</CardTitle>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    {selectedDays}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  {selectedCompetitor}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Metric</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Your Site</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Competitor A</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Competitor B</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Competitor C</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Competitor D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{row.metric}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{row.yourSite}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{row.competitorA}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{row.competitorB}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{row.competitorC}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-700">{row.competitorD}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button className="bg-primary hover:bg-primary-600 text-white">
                    View Full Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Quick Wins */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900">Top 10 Quick Wins</CardTitle>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickWins.map((win) => (
                    <div key={win.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <button className="mt-1 flex-shrink-0">
                        {win.completed ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{win.title}</h4>
                        <p className="text-xs text-gray-600">{win.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}