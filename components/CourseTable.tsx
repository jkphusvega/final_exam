'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Course } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CourseTableProps {
  courses: Course[]
  totalCount: number
  page: number
  pageSize: number
  search: string
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  loading: boolean
}

export default function CourseTable({
  courses,
  totalCount,
  page,
  pageSize,
  search,
  onPageChange,
  onSearchChange,
  loading,
}: CourseTableProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [localSearch])

  // Track if we have successfully loaded data at least once
  useEffect(() => {
    if (!loading) {
      setHasLoadedOnce(true)
    }
  }, [loading])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const cleanSchedule = (timeStr: string) => {
    if (!timeStr) return '-'
    return timeStr.trim().replace(/^\[|\]$/g, '')
  }

  const showSkeleton = loading && !hasLoadedOnce

  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <CardTitle className="text-base font-semibold text-slate-800">상세 강좌 정보</CardTitle>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="교과목명, 교수, 코드 검색..."
              value={localSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:bg-white"
            />
          </div>
          {/* Total Count Badge */}
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg shrink-0 text-center sm:text-left">
            총 {totalCount.toLocaleString()}개 강좌
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Container */}
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">대학</TableHead>
                <TableHead className="font-semibold text-slate-700">학과</TableHead>
                <TableHead className="font-semibold text-slate-700">교과목명</TableHead>
                <TableHead className="font-semibold text-slate-700">이수구분</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">학점</TableHead>
                <TableHead className="font-semibold text-slate-700">담당교수</TableHead>
                <TableHead className="font-semibold text-slate-700">요일/시간</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">수강/정원</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">수강률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={cn(
              "transition-opacity duration-200",
              loading && hasLoadedOnce ? "opacity-50 pointer-events-none" : ""
            )}>
              {showSkeleton ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-slate-400">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((c) => {
                  const limit = c.정원 || 0
                  const current = c.수강 || 0
                  const rate = limit > 0 ? (current / limit) * 100 : 0

                  return (
                    <TableRow key={c.순번} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-800 font-medium truncate max-w-[120px]">{c['대학(원)']}</TableCell>
                      <TableCell className="text-slate-600 truncate max-w-[120px]">{c['학과(부)']}</TableCell>
                      <TableCell className="font-semibold text-slate-900 truncate max-w-[200px]" title={c.교과목명}>
                        <span className="block text-slate-400 text-xs font-normal mb-0.5">{c.학수번호}</span>
                        {c.교과목명}
                      </TableCell>
                      <TableCell className="text-slate-600">{c.이수구분}</TableCell>
                      <TableCell className="text-center text-slate-800 font-medium">{c.학점}학점</TableCell>
                      <TableCell className="text-slate-700 font-medium">{c.담당교수 || '-'}</TableCell>
                      <TableCell className="text-slate-500 text-xs max-w-[200px] truncate" title={c['시간표(시간)'] || c['시간표(교시)']}>
                        {cleanSchedule(c['시간표(시간)'] || c['시간표(교시)'] || '')}
                      </TableCell>
                      <TableCell className="text-right text-slate-800 font-medium">
                        {current} / {limit}
                      </TableCell>
                      <TableCell className="text-right text-slate-600 font-semibold">
                        {rate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-slate-500">
            {page} / {totalPages} 페이지
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
