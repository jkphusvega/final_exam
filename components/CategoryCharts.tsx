'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CategoryChartsProps {
  categoryCounts: { category: string; count: number }[]
  categoryAvgEnrollments: { category: string; avgEnrollment: number }[]
  loading: boolean
  activeCategory?: string | null
  onCategoryClick?: (category: string) => void
}

export default function CategoryCharts({
  categoryCounts,
  categoryAvgEnrollments,
  loading,
  activeCategory,
  onCategoryClick,
}: CategoryChartsProps) {
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

  // INU Brand color configuration for base & highlight
  const baseColor = '#003087' // INU Blue
  const highlightColor = '#ffa600' // INU Yellow

  // Calculate maximum values for highlighting
  const maxCount = categoryCounts.length > 0 ? Math.max(...categoryCounts.map(d => d.count)) : 0
  const maxAvg = categoryAvgEnrollments.length > 0 ? Math.max(...categoryAvgEnrollments.map(d => d.avgEnrollment)) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: 이수구분별 강좌 수 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">이수구분별 강좌 수</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryCounts}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: any) => [`${value}개`, '강좌 수']}
              />
              <Bar
                dataKey="count"
                fill={baseColor}
                radius={[0, 4, 4, 0]}
                barSize={20}
                cursor="pointer"
                onClick={(data: any) => onCategoryClick?.(data.category ?? data.payload?.category)}
              >
                {categoryCounts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      activeCategory === entry.category
                        ? highlightColor
                        : entry.count === maxCount && !activeCategory
                        ? highlightColor
                        : baseColor
                    }
                    opacity={activeCategory && activeCategory !== entry.category ? 0.4 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Right: 이수구분별 평균 수강인원 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">이수구분별 평균 수강인원</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryAvgEnrollments}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: any) => [`${value}명`, '평균 수강인원']}
              />
              <Bar dataKey="avgEnrollment" fill={baseColor} radius={[0, 4, 4, 0]} barSize={20}>
                {categoryAvgEnrollments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.avgEnrollment === maxAvg ? highlightColor : baseColor}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
