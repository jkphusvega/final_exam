'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, TrendingUp, Globe } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
interface StatsCardsProps {
  stats: {
    totalCourses: number
    totalEnrollment: number
    avgAttendanceRate: number
    foreignLectureRate: number
  } | null
  loading: boolean
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cardData = [
    {
      title: '총 강좌 수',
      value: stats.totalCourses.toLocaleString() + '개',
      icon: BookOpen,
      color: '#003087', // INU Blue
      bgColor: 'bg-[#003087]',
      iconColor: 'text-white',
    },
    {
      title: '총 수강 인원',
      value: stats.totalEnrollment.toLocaleString() + '명',
      icon: Users,
      color: '#003087', // INU Blue
      bgColor: 'bg-[#003087]',
      iconColor: 'text-white',
    },
    {
      title: '평균 수강률',
      value: stats.avgAttendanceRate.toFixed(1) + '%',
      icon: TrendingUp,
      color: '#003087', // INU Blue
      bgColor: 'bg-[#003087]',
      iconColor: 'text-white',
    },
    {
      title: '원어 강의 비율',
      value: stats.foreignLectureRate.toFixed(1) + '%',
      icon: Globe,
      color: '#003087',
      bgColor: 'bg-[#003087]',
      iconColor: 'text-white',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="glass-card hover:shadow-md transition-shadow duration-200"
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor} shrink-0`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{card.value}</div>
              <p className="text-xs text-slate-400 mt-1">인천대학교 2026-1학기</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
