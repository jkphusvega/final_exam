'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface CollegeSummary {
  collegeName: string
  courseCount: number
  totalEnrollment: number
  avgAttendanceRate: number
}

interface CollegeSummaryTableProps {
  summary: CollegeSummary[]
  loading: boolean
}

import { Skeleton } from '@/components/ui/skeleton'

export default function CollegeSummaryTable({ summary, loading }: CollegeSummaryTableProps) {
  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#003087]">대학(원)별 강좌 분석 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Helper function to color badge based on rate
  const getRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold">{rate.toFixed(1)}%</Badge>
    if (rate >= 75) return <Badge className="bg-[#1a4fa8] hover:bg-[#1a4fa8] text-white font-semibold">{rate.toFixed(1)}%</Badge>
    if (rate >= 50) return <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-semibold">{rate.toFixed(1)}%</Badge>
    return <Badge className="bg-rose-500 hover:bg-rose-500 text-white font-semibold">{rate.toFixed(1)}%</Badge>
  }

  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#003087]">대학(원)별 강좌 분석 요약</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-[#003087]">
              <TableRow className="hover:bg-[#003087] border-b-0">
                <TableHead className="font-bold text-white">대학명</TableHead>
                <TableHead className="font-bold text-white text-right">강좌 수</TableHead>
                <TableHead className="font-bold text-white text-right">수강인원 합계</TableHead>
                <TableHead className="font-bold text-white text-center">평균 수강률(%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((row) => (
                <TableRow key={row.collegeName} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-800">{row.collegeName}</TableCell>
                  <TableCell className="text-right text-slate-600">{row.courseCount.toLocaleString()}개</TableCell>
                  <TableCell className="text-right text-slate-600">{row.totalEnrollment.toLocaleString()}명</TableCell>
                  <TableCell className="text-center">{getRateBadge(row.avgAttendanceRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
