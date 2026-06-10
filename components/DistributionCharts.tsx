'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DistributionChartsProps {
  teachingMethods: { name: string; value: number }[]
  creditDistribution: { name: string; value: number }[]
  loading: boolean
}

const COLORS = ['#003087', '#ffa600', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#94a3b8']

import { Skeleton } from '@/components/ui/skeleton'

export default function DistributionCharts({
  teachingMethods,
  creditDistribution,
  loading,
}: DistributionChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="glass-card">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="w-full h-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate totals and sort data descending
  const totalMethods = teachingMethods.reduce((sum, item) => sum + item.value, 0)
  const sortedMethods = [...teachingMethods].sort((a, b) => b.value - a.value)

  const totalCredits = creditDistribution.reduce((sum, item) => sum + item.value, 0)
  const sortedCredits = [...creditDistribution].sort((a, b) => b.value - a.value)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: 수업방법 유형 분포 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">수업방법 유형 분포</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="flex flex-row items-center justify-between h-full py-4">
            {/* Pie Chart Container */}
            <div className="relative w-[50%] h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sortedMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: any, _: any, entry: any) => {
                      const pct = totalMethods > 0 ? ((value / totalMethods) * 100).toFixed(1) : 0
                      return [`${value.toLocaleString()}개 (${pct}%)`, entry.name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase block mb-0.5">TOTAL</span>
                <span className="text-xl font-extrabold text-slate-800 leading-none">
                  {totalMethods.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Custom Legend Container */}
            <div className="w-[50%] flex flex-col justify-center space-y-2.5 pl-4 pr-6">
              {sortedMethods.map((entry, index) => {
                const percentage = totalMethods > 0 ? ((entry.value / totalMethods) * 100).toFixed(1) : '0.0'
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate text-slate-700" title={entry.name}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: 학점 구성 비율 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">학점 구성 비율</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="flex flex-row items-center justify-between h-full py-4">
            {/* Pie Chart Container */}
            <div className="relative w-[50%] h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedCredits}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sortedCredits.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, _: any, entry: any) => {
                      const pct = totalCredits > 0 ? ((value / totalCredits) * 100).toFixed(1) : 0
                      return [`${value.toLocaleString()}개 (${pct}%)`, entry.name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase block mb-0.5">COURSES</span>
                <span className="text-xl font-extrabold text-slate-800 leading-none">
                  {totalCredits.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Custom Legend Container */}
            <div className="w-[50%] flex flex-col justify-center space-y-2.5 pl-4 pr-6">
              {sortedCredits.map((entry, index) => {
                const percentage = totalCredits > 0 ? ((entry.value / totalCredits) * 100).toFixed(1) : '0.0'
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate text-slate-700" title={entry.name}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
