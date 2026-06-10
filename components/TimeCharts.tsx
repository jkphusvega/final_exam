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

interface TimeChartsProps {
  coursesByDay: { day: string; count: number }[]
  coursesByTime: { timeRange: string; count: number }[]
  loading: boolean
  activeDay?: string | null
  activeTime?: string | null
  onDayClick?: (day: string) => void
  onTimeClick?: (timeRange: string) => void
}

import { Skeleton } from '@/components/ui/skeleton'

export default function TimeCharts({
  coursesByDay,
  coursesByTime,
  loading,
  activeDay,
  activeTime,
  onDayClick,
  onTimeClick,
}: TimeChartsProps) {
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
  const baseColorDay = '#003087' // INU Blue
  const highlightColorDay = '#ffa600' // INU Yellow

  const baseColorTime = '#003087' // INU Blue
  const highlightColorTime = '#ffa600' // INU Yellow

  // Calculate maximum values for highlighting
  const maxDayCount = coursesByDay.length > 0 ? Math.max(...coursesByDay.map(d => d.count)) : 0
  const maxTimeCount = coursesByTime.length > 0 ? Math.max(...coursesByTime.map(d => d.count)) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: 요일별 수업 강좌 수 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">요일별 수업 강좌 수</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={coursesByDay}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis
                dataKey="day"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={50}
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
                fill={baseColorDay}
                radius={[0, 4, 4, 0]}
                barSize={20}
                cursor="pointer"
                onClick={(data: any) => onDayClick?.(data.day ?? data.payload?.day)}
              >
                {coursesByDay.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      activeDay === entry.day
                        ? highlightColorDay
                        : entry.count === maxDayCount && !activeDay
                        ? highlightColorDay
                        : baseColorDay
                    }
                    opacity={activeDay && activeDay !== entry.day ? 0.4 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Right: 수업 시간별 강좌 수 */}
      <Card className="glass-card hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">수업 시간별 강좌 수</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={coursesByTime}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis
                dataKey="timeRange"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={90}
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
                fill={baseColorTime}
                radius={[0, 4, 4, 0]}
                barSize={20}
                cursor="pointer"
                onClick={(data: any) => onTimeClick?.(data.timeRange ?? data.payload?.timeRange)}
              >
                {coursesByTime.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      activeTime === entry.timeRange
                        ? highlightColorTime
                        : entry.count === maxTimeCount && !activeTime
                        ? highlightColorTime
                        : baseColorTime
                    }
                    opacity={activeTime && activeTime !== entry.timeRange ? 0.4 : 1}
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
