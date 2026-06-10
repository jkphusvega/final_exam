'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface AlertRow {
  교과목명: string
  학과: string
  담당교수: string
  수강: number
  정원: number
  rate: number
}

interface EnrollmentAlertsProps {
  overEnrolled: AlertRow[]
  overTotal: number
  underEnrolled: AlertRow[]
  underTotal: number
  loading: boolean
}

export default function EnrollmentAlerts({ overEnrolled, overTotal, underEnrolled, underTotal, loading }: EnrollmentAlertsProps) {
  const [tab, setTab] = useState<'over' | 'under'>('over')
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  React.useEffect(() => {
    if (!loading) setHasLoadedOnce(true)
  }, [loading])

  if (loading && !hasLoadedOnce) {
    return (
      <Card className="glass-card h-full">
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  const list = tab === 'over' ? overEnrolled : underEnrolled

  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-[#003087] flex items-center gap-2">
          수강률 이상 강좌
        </CardTitle>
        {/* 탭 */}
        <div className="flex mt-2 rounded-lg overflow-hidden border border-slate-200 text-xs font-bold w-fit">
          <button
            onClick={() => setTab('over')}
            className={`px-4 py-1.5 transition-colors ${tab === 'over' ? 'bg-red-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            정원 초과 {overTotal > 0 && <span className={`ml-1 rounded-full px-1.5 ${tab === 'over' ? 'bg-red-400 text-white' : 'bg-red-100 text-red-600'}`}>{overTotal}</span>}
          </button>
          <button
            onClick={() => setTab('under')}
            className={`px-4 py-1.5 transition-colors ${tab === 'under' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            수강 저조 {underTotal > 0 && <span className={`ml-1 rounded-full px-1.5 ${tab === 'under' ? 'bg-amber-400 text-white' : 'bg-amber-100 text-amber-600'}`}>{underTotal}</span>}
          </button>
        </div>
      </CardHeader>

      <CardContent className={`transition-opacity duration-200 ${loading && hasLoadedOnce ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
            {tab === 'over' ? '정원 초과 강좌가 없습니다.' : '수강 저조 강좌가 없습니다.'}
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((row, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                  tab === 'over'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-amber-50 border-amber-100'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-slate-800 truncate" title={row.교과목명}>
                    {row.교과목명}
                  </p>
                  <p className="text-slate-500 truncate">{row.학과} · {row.담당교수 || '-'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-slate-600">{row.수강} / {row.정원}</p>
                  <p className={`font-extrabold ${tab === 'over' ? 'text-red-500' : 'text-amber-500'}`}>
                    {Math.round(row.rate)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        {list.length > 0 && (
          <p className="text-xs text-slate-400 text-center mt-2">
            전체 {tab === 'over' ? overTotal : underTotal}개 강좌
          </p>
        )}
      </CardContent>
    </Card>
  )
}
